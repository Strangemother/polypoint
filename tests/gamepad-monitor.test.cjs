const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function makeGamepad(index) {
    return {
        index,
        connected: true,
        mapping: 'standard',
        axes: [0, 0, 0, 0],
        buttons: Array.from(
            {length: 17}, () => ({pressed: false, value: 0})
        )
    };
}

function createMonitor(gamepads, stage = {}, options = {}) {
    const listeners = {};
    const logs = [];
    const context = {
        navigator: {getGamepads: () => gamepads},
        window: {
            addEventListener(type, handler) {
                listeners[type] = handler;
            }
        },
        console: {log: (...args) => logs.push(args), warn() {}},
        Polypoint: {head: {deferredProp() {}}}
    };
    vm.createContext(context);
    const file = path.join(__dirname, '../theatre/pets/v1/gamepad.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file});
    const GamepadMonitor = vm.runInContext('GamepadMonitor', context);
    const monitor = new GamepadMonitor(stage, options);
    return {
        monitor,
        logs,
        dispatch(type, gamepad) {
            listeners[type]({gamepad});
        }
    };
}

test('reports selected connections to callbacks and stage on wake', () => {
    const first = makeGamepad(0);
    const second = makeGamepad(1);
    const gamepads = [first, second];
    const constructorConnections = [];
    const events = [];
    const stage = {
        onGamepadConnect({gamepad}) {
            assert.equal(this, stage);
            events.push(['connect', gamepad.index]);
        },
        onGamepadDisconnect({gamepad}) {
            assert.equal(this, stage);
            events.push(['disconnect', gamepad.index]);
        }
    };
    const {monitor, dispatch} = createMonitor(gamepads, stage, {
        onConnect: ({gamepad}) => constructorConnections.push(gamepad.index)
    });

    assert.deepEqual(constructorConnections, [0]);
    monitor.wake();
    monitor.wake();
    assert.deepEqual(events, [['connect', 0]]);
    dispatch('gamepadconnected', second);
    dispatch('gamepaddisconnected', second);
    assert.deepEqual(events, [['connect', 0]]);

    gamepads[0] = null;
    dispatch('gamepaddisconnected', first);
    assert.deepEqual(events, [
        ['connect', 0], ['disconnect', 0], ['connect', 1]
    ]);

    gamepads[1] = null;
    dispatch('gamepaddisconnected', second);
    gamepads[0] = first;
    dispatch('gamepadconnected', first);
    assert.deepEqual(events.slice(-2), [
        ['disconnect', 1], ['connect', 0]
    ]);
});

test('reports raw inputs without interpreting or omitting indices', () => {
    const gamepad = makeGamepad(0);
    gamepad.mapping = '';
    gamepad.axes = [0, 0, 0, 0, 0, -.5];
    gamepad.buttons[6] = {pressed: true, value: .4, touched: true};
    gamepad.buttons[7] = {pressed: false, value: .2, touched: false};
    gamepad.buttons[12] = {pressed: true, value: 1, touched: true};
    const gamepads = [gamepad];
    const axes = [];
    const buttons = [];
    const stage = {
        onGamepadAxis({axis, value, axes: snapshot}) {
            assert.equal(this, stage);
            axes.push([axis, value, snapshot[5]]);
            if (axis === 0) snapshot[5] = 100;
        },
        onGamepadButton({button, value, pressed, touched}) {
            assert.equal(this, stage);
            buttons.push([button, value, pressed, touched]);
        }
    };
    const {monitor, dispatch} = createMonitor(gamepads, stage);
    monitor.wake();
    monitor.update();
    monitor.update();
    assert.equal(axes.length, 6);
    assert.deepEqual(axes[5], [5, -.5, -.5]);
    assert.equal(buttons.length, 17);
    assert.deepEqual(buttons[6], [6, .4, true, true]);
    assert.deepEqual(buttons[7], [7, .2, false, false]);
    assert.deepEqual(buttons[12], [12, 1, true, true]);

    gamepad.axes[5] = -.001;
    gamepad.buttons[7] = {pressed: false, value: .3, touched: true};
    monitor.update();
    assert.deepEqual(axes.at(-1), [5, -.001, -.001]);
    assert.deepEqual(buttons.at(-1), [7, .3, false, true]);
    gamepad.buttons[7].touched = false;
    monitor.update();
    assert.deepEqual(buttons.at(-1), [7, .3, false, false]);

    const counts = [axes.length, buttons.length];
    gamepads[0] = null;
    dispatch('gamepaddisconnected', gamepad);
    assert.deepEqual([axes.length, buttons.length], counts);
    gamepads[0] = gamepad;
    dispatch('gamepadconnected', gamepad);
    monitor.update();
    assert.equal(axes.length, counts[0] + 6);
    assert.equal(buttons.length, counts[1] + 17);
});

test('default handlers handle every event without callbacks', () => {
    const gamepads = [];
    const {monitor, logs, dispatch} = createMonitor(gamepads);
    monitor.wake();
    const gamepad = makeGamepad(0);
    gamepads[0] = gamepad;
    dispatch('gamepadconnected', gamepad);
    gamepad.axes[0] = 1;
    gamepad.buttons[6] = {pressed: true, value: .5};
    monitor.update();
    gamepads[0] = null;
    dispatch('gamepaddisconnected', gamepad);
    assert.deepEqual(
        [...new Set(logs.map(args => args[0]))],
        ['gamepad connected', 'axis', 'button', 'gamepad disconnected']
    );
});

test('constructor callbacks remain active when stage has no handlers', () => {
    const gamepad = makeGamepad(0);
    const gamepads = [gamepad];
    const events = [];
    const {monitor, dispatch} = createMonitor(gamepads, {}, {
        onAxis: ({axis, value}) => {
            if (axis === 0) events.push(['axis', axis, value]);
        },
        onButton: ({button, value}) => {
            if (button === 15) events.push(['button', button, value]);
        },
        onDisconnect: ({gamepad}) => {
            events.push(['disconnect', gamepad.index]);
        }
    });
    monitor.wake();
    gamepad.axes[0] = .5;
    gamepad.buttons[15] = {pressed: true, value: 1};
    monitor.update();
    gamepads[0] = null;
    dispatch('gamepaddisconnected', gamepad);
    assert.deepEqual(events, [
        ['axis', 0, .5], ['button', 15, 1], ['disconnect', 0]
    ]);
});

function createStage(gamepads) {
    const listeners = {};
    const warnings = [];
    class Stage {
        static go() {
            const stage = new this();
            stage.center = {xy: {x: 0, y: 0}};
            stage.dragging = {add() {}};
            const Monitor = vm.runInContext('GamepadMonitor', context);
            stage.gamepad = new Monitor(stage);
            stage.mounted();
            return stage;
        }
    }
    class Chromite {
        constructor() {
            this.point = {radians: 0};
            this.intent = null;
        }
        setIntent({speed, angle, duration}) {
            this.intent = {
                speed, heading: angle * Math.PI / 180, remaining: duration
            };
        }
        clearIntent() {
            this.intent = null;
        }
    }
    const context = {
        Stage, Chromite,
        navigator: {getGamepads: () => gamepads},
        window: {
            addEventListener(type, handler) {
                listeners[type] = handler;
            }
        },
        console: {log() {}, warn: message => warnings.push(message)},
        Polypoint: {head: {deferredProp() {}}}
    };
    vm.createContext(context);
    for (const name of ['pets/v1/gamepad.js', 'pet-v1.js']) {
        const file = path.join(__dirname, '../theatre', name);
        vm.runInContext(fs.readFileSync(file, 'utf8'), context, {
            filename: file
        });
    }
    return {
        stage: vm.runInContext('stage', context),
        warnings,
        dispatch(type, gamepad) {
            listeners[type]({gamepad});
        }
    };
}

test('stage translates standard input and releases it on disconnect', () => {
    const gamepad = makeGamepad(0);
    gamepad.axes = [.8, .6, 0, 0];
    gamepad.buttons[7] = {pressed: true, value: .7};
    gamepad.buttons[12] = {pressed: true, value: 1};
    const gamepads = [gamepad];
    const {stage, dispatch} = createStage(gamepads);
    const sticks = [];
    const directions = [];
    const onStick = stage.onGamepadStick.bind(stage);
    stage.onGamepadStick = input => {
        sticks.push([input.stick, input.x, input.y]);
        onStick(input);
    };
    stage.onGamepadDpad = input => {
        directions.push([input.direction, input.pressed]);
    };

    stage.gamepad.update();
    assert.deepEqual(sticks, [['left', .8, .6]]);
    assert.deepEqual(directions, [['up', true]]);
    assert.equal(stage.chromite.intent.speed, .7);
    assert.ok(Math.abs(stage.chromite.intent.heading -
        Math.atan2(.6, .8)) < 1e-10);

    gamepad.axes = [.001, .001, 0, 0];
    gamepad.buttons[7] = {pressed: false, value: .3};
    gamepad.buttons[12] = {pressed: false, value: 0};
    gamepad.buttons[13] = {pressed: true, value: 1};
    stage.gamepad.update();
    assert.deepEqual(sticks.at(-1), ['left', 0, 0]);
    assert.equal(stage.chromite.intent.speed, .3);
    assert.deepEqual(directions, [
        ['up', true], ['up', false], ['down', true]
    ]);

    gamepads[0] = null;
    dispatch('gamepaddisconnected', gamepad);
    assert.deepEqual(directions.at(-1), ['down', false]);
    assert.equal(stage.rightTriggerValue, 0);
    assert.equal(stage.chromite.intent.speed, .3);
});

test('stage does not interpret non-standard input as standard controls', () => {
    const gamepad = makeGamepad(0);
    gamepad.mapping = '';
    gamepad.axes = [.8, .6, 0, 0, -.5];
    gamepad.buttons[6] = {pressed: true, value: .8};
    gamepad.buttons[12] = {pressed: true, value: 1};
    const {stage, warnings} = createStage([gamepad]);
    const interpreted = [];
    const rawAxes = [];
    const rawButtons = [];
    stage.onGamepadStick = () => interpreted.push('stick');
    stage.onGamepadTrigger = () => interpreted.push('trigger');
    stage.onGamepadDpad = () => interpreted.push('d-pad');
    const onAxis = stage.gamepad.onAxis;
    const onButton = stage.gamepad.onButton;
    stage.gamepad.onAxis = input => {
        rawAxes.push(input.axis);
        onAxis(input);
    };
    stage.gamepad.onButton = input => {
        rawButtons.push(input.button);
        onButton(input);
    };

    stage.gamepad.update();
    assert.deepEqual(interpreted, []);
    assert.ok(rawAxes.includes(4));
    assert.ok(rawButtons.includes(6));
    assert.ok(rawButtons.includes(12));
    assert.equal(stage.chromite.intent, null);
    assert.equal(warnings.length, 1);
});

test('stage warns when a standard controller lacks required controls', () => {
    const gamepad = makeGamepad(0);
    gamepad.axes = [0];
    gamepad.buttons = [];
    const {stage, warnings} = createStage([gamepad]);
    stage.gamepad.update();
    assert.deepEqual(warnings, [
        'Gamepad is missing standard sticks or triggers'
    ]);
});
