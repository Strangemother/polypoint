const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function createExample(gamepads = []) {
    class Point {
        constructor(properties) {
            Object.assign(this, properties);
            this.pen = {indicator() {}};
        }
    }
    class PointList extends Array {
        get pen() {
            return {quadCurve() {}};
        }
    }
    class Stage {
        static go() {
            const stage = new this();
            stage.canvas = {width: 800, height: 600};
            stage.dimensions = {width: 800, height: 600};
            stage.events = {on() {}};
            const StageScreenWrap = vm.runInContext(
                'StageScreenWrap', context
            );
            stage.screenWrap = new StageScreenWrap(stage);
            stage.center = {xy: {x: 400, y: 300}};
            stage.dragging = {add() {}};
            stage.mounted();
            return stage;
        }
        clear() {}
    }
    const listeners = {};
    const context = {
        Point, PointList, Stage, Polypoint: {head: {deferredProp() {}}},
        navigator: {getGamepads: () => gamepads},
        addEventListener(type, listener) {
            listeners[type] = listener;
        }
    };
    context.window = context;
    vm.createContext(context);

    const demoPath = path.join(root, 'theatre/pet-v1.js');
    const demo = fs.readFileSync(demoPath, 'utf8');
    const dependencies = demo.split('---')[0].split('\n')
        .map(line => line.trim());
    for (const dependency of [
        '../point_src/screenwrap.js',
        '../theatre/pets/v1/chromite.js'
    ]) {
        assert.ok(dependencies.includes(dependency));
        const file = path.resolve(path.dirname(demoPath), dependency);
        vm.runInContext(fs.readFileSync(file, 'utf8'), context, {
            filename: file
        });
    }
    vm.runInContext(demo, context, {filename: demoPath});
    const example = vm.runInContext('({Chromite, stage})', context);
    example.stage.chromite.update = () => {};
    example.stage.chromite.draw = () => {};
    example.dispatchGamepad = (type, gamepad) => {
        listeners[type]({gamepad});
    };
    return example;
}

function drawFrames(stage, count) {
    for (let i = 0; i < count; i++) stage.draw({});
}

function makeGamepad(index, axes = [0, 0, 0, 0]) {
    return {
        index,
        connected: true,
        mapping: 'standard',
        axes,
        buttons: Array.from(
            {length: 17}, () => ({pressed: false, value: 0})
        )
    };
}

test('wraps beyond the radius on every edge and retains the tail', () => {
    const {stage} = createExample();
    const p = stage.chromite.point;
    const tail = p.tail;
    p.radius = 4;
    stage.canvas.width = 100;
    stage.canvas.height = 80;
    let calls = 0;
    const performMany = stage.screenWrap.performMany.bind(stage.screenWrap);
    stage.screenWrap.performMany = (...args) => {
        calls++;
        return performMany(...args);
    };
    const cases = [
        [-5, 50, 104, 50],
        [105, 50, -4, 50],
        [50, -5, 50, 84],
        [50, 85, 50, -4],
        [105, -5, -4, 84]
    ];
    for (const [x, y, expectedX, expectedY] of cases) {
        p.x = x;
        p.y = y;
        stage.draw({});
        assert.equal(p.x, expectedX);
        assert.equal(p.y, expectedY);
        assert.equal(p.tail, tail);
    }
    assert.equal(calls, cases.length);
    assert.ok(p.screenWrapSector);
});

test('keeps boundary points and uses current canvas dimensions', () => {
    const {stage} = createExample();
    const p = stage.chromite.point;
    const tail = p.tail;
    p.vx = p.vy = 0;
    p.x = -p.radius;
    p.y = 100;
    stage.draw({});
    assert.equal(p.x, -p.radius);
    assert.equal(p.tail, tail);

    stage.canvas.width = 1200;
    p.x = 1201 + p.radius;
    stage.draw({});
    assert.equal(p.x, -p.radius);
    assert.equal(p.tail, tail);
});

test('creates a persistent tail and moves it during updates, not draws', () => {
    const {Chromite} = createExample();
    const chromite = new Chromite({x: 100, y: 100, mass: 1});
    const p = chromite.point;
    const tail = p.tail;
    const segments = Array.from(tail);
    const spacing = Math.max(1.1, p.radius * .48);

    assert.equal(tail.length, 7);
    for (let i = 0; i < tail.length; i++) {
        assert.ok(Math.abs(tail[i].x -
            (p.x - Math.cos(p.radians) * spacing * (i + 1))) < 1e-10);
        assert.ok(Math.abs(tail[i].y -
            (p.y - Math.sin(p.radians) * spacing * (i + 1))) < 1e-10);
    }

    p.radians = 0;
    p.vx = 1;
    p.vy = 0;
    chromite.setIntent({speed: 1, angle: 0});
    const initial = tail.map(point => [point.x, point.y]);
    chromite.update();
    chromite.update();
    assert.equal(p.tail, tail);
    for (let i = 0; i < tail.length; i++) {
        assert.equal(tail[i], segments[i]);
    }
    assert.notDeepEqual(tail.map(point => [point.x, point.y]), initial);

    const afterUpdate = tail.map(point => [point.x, point.y]);
    const phase = p.swimPhase;
    chromite.draw({});
    chromite.draw({});
    assert.deepEqual(tail.map(point => [point.x, point.y]), afterUpdate);
    assert.equal(p.swimPhase, phase);
});

test('repositions the same tail segments after wrapping each axis', () => {
    const {stage} = createExample();
    const p = stage.chromite.point;
    const tail = p.tail;
    const segments = Array.from(tail);
    p.radians = Math.PI / 3;
    p.radius = 4;
    const spacing = p.radius * .48;
    const cases = [
        [-1, 300, 800, 300],
        [801, 300, 0, 300],
        [400, -1, 400, 600],
        [400, 601, 400, 0],
        [801, -1, 0, 600]
    ];
    for (const [x, y, expectedX, expectedY] of cases) {
        p.x = x;
        p.y = y;
        stage.screenWrap.perform(p);
        assert.equal(p.x, expectedX);
        assert.equal(p.y, expectedY);
        assert.equal(p.tail, tail);
        for (let i = 0; i < tail.length; i++) {
            assert.equal(tail[i], segments[i]);
            assert.ok(Math.abs(tail[i].x - (expectedX -
                Math.cos(p.radians) * spacing * (i + 1))) < 1e-10);
            assert.ok(Math.abs(tail[i].y - (expectedY -
                Math.sin(p.radians) * spacing * (i + 1))) < 1e-10);
        }
    }
});

test('gamepad stick changes report coordinates without steering', () => {
    const gamepads = [];
    const {stage, dispatchGamepad} = createExample(gamepads);
    const inputs = [];
    stage.onStickInput = input => inputs.push(input);
    stage.draw({});
    assert.equal(inputs.length, 0);

    const first = makeGamepad(1);
    const other = makeGamepad(0, [-1, 0, 0, 0]);
    gamepads[1] = first;
    dispatchGamepad('gamepadconnected', first);
    gamepads[0] = other;
    dispatchGamepad('gamepadconnected', other);
    first.axes = [0, -0.5, 0, 0];
    drawFrames(stage, 3);
    assert.equal(inputs.length, 0);
    stage.draw({});
    assert.equal(inputs.length, 1);
    assert.equal(inputs[0].stick, 'left');
    assert.equal(inputs[0].x, 0);
    assert.equal(inputs[0].y, -.5);
    assert.equal('angle' in inputs[0], false);
    assert.equal('speed' in inputs[0], false);
    assert.equal(stage.chromite.intent, null);

    drawFrames(stage, 10);
    assert.equal(inputs.length, 1);
    first.axes = [1, 1, 0, 0];
    drawFrames(stage, 10);
    assert.equal(inputs[1].x, 1);
    assert.equal(inputs[1].y, 1);
    first.axes = [.001, -.001, 0, 0];
    drawFrames(stage, 10);
    assert.equal(inputs[2].x, 0);
    assert.equal(inputs[2].y, 0);
    drawFrames(stage, 10);
    assert.equal(inputs.length, 3);
});

test('gamepad monitor handles existing and disconnected controllers', () => {
    const first = makeGamepad(0, [-1, 0, 0, 0]);
    const other = makeGamepad(1, [0, 1, 0, 0]);
    const third = makeGamepad(2, [1, 0, 0, 0]);
    const gamepads = [first, other, third];
    const {stage, dispatchGamepad} = createExample(gamepads);
    const inputs = [];
    stage.onStickInput = input => inputs.push(input);

    stage.draw({});
    assert.equal(inputs[0].x, -1);
    assert.equal(inputs[0].y, 0);
    gamepads[2] = null;
    dispatchGamepad('gamepaddisconnected', third);
    drawFrames(stage, 10);
    assert.equal(inputs.length, 1);

    gamepads[0] = null;
    dispatchGamepad('gamepaddisconnected', first);
    assert.equal(inputs[1].x, 0);
    assert.equal(inputs[1].y, 0);
    drawFrames(stage, 10);
    assert.equal(inputs[2].x, 0);
    assert.equal(inputs[2].y, 1);

    gamepads[1] = null;
    dispatchGamepad('gamepaddisconnected', other);
    assert.equal(inputs[3].x, 0);
    assert.equal(inputs[3].y, 0);
    stage.draw({});
    assert.equal(inputs.length, 4);

    gamepads[2] = third;
    dispatchGamepad('gamepadconnected', third);
    drawFrames(stage, 10);
    assert.equal(inputs[4].x, 1);
    assert.equal(inputs[4].y, 0);
});

test('gamepad reports both sticks, triggers and button changes', () => {
    const gamepad = makeGamepad(0);
    const {stage} = createExample([gamepad]);
    const sticks = [];
    const triggers = [];
    const buttons = [];
    stage.onStickInput = input => sticks.push(input);
    stage.onTriggerInput = input => triggers.push(input);
    stage.onButtonInput = input => buttons.push(input);

    gamepad.axes = [1, 0, 0, -0.5];
    gamepad.buttons[6] = {value: .4, pressed: true};
    gamepad.buttons[7] = {value: .8, pressed: true};
    gamepad.buttons[0] = {value: 1, pressed: true};
    gamepad.buttons[12] = {value: 1, pressed: true};
    stage.draw({});

    assert.deepEqual(sticks.map(input => input.stick), ['left', 'right']);
    assert.equal(sticks[0].x, 1);
    assert.equal(sticks[0].y, 0);
    assert.equal(sticks[1].x, 0);
    assert.equal(sticks[1].y, -.5);
    assert.deepEqual(triggers.map(input => input.trigger), ['left', 'right']);
    assert.deepEqual(triggers.map(input => input.value), [.4, .8]);
    assert.deepEqual(buttons.map(input => input.button), [0, 12]);
    assert.ok(buttons.every(input => input.pressed));
    assert.equal(stage.chromite.intent, null);

    drawFrames(stage, 10);
    assert.equal(sticks.length, 2);
    assert.equal(triggers.length, 2);
    assert.equal(buttons.length, 2);

    gamepad.axes = [0, 0, 0, 0];
    gamepad.buttons[6] = {value: .2, pressed: false};
    gamepad.buttons[7] = {value: 0, pressed: false};
    gamepad.buttons[0] = {value: 0, pressed: false};
    gamepad.buttons[12] = {value: 0, pressed: false};
    drawFrames(stage, 10);
    assert.deepEqual(sticks.slice(2).map(input => [input.x, input.y]),
        [[0, 0], [0, 0]]);
    assert.deepEqual(triggers.slice(2).map(input => input.value), [.2, 0]);
    assert.deepEqual(buttons.slice(2).map(input => input.pressed),
        [false, false]);
});

test('gamepad disconnect releases all active controls', () => {
    const gamepad = makeGamepad(0, [1, 0, 0, 1]);
    gamepad.buttons[6] = {value: .5, pressed: true};
    gamepad.buttons[7] = {value: 1, pressed: true};
    gamepad.buttons[3] = {value: 1, pressed: true};
    const gamepads = [gamepad];
    const {stage, dispatchGamepad} = createExample(gamepads);
    const sticks = [];
    const triggers = [];
    const buttons = [];
    stage.onStickInput = input => sticks.push(input);
    stage.onTriggerInput = input => triggers.push(input);
    stage.onButtonInput = input => buttons.push(input);

    stage.draw({});
    gamepads[0] = null;
    dispatchGamepad('gamepaddisconnected', gamepad);

    assert.deepEqual(sticks.slice(2).map(input => [input.x, input.y]),
        [[0, 0], [0, 0]]);
    assert.deepEqual(triggers.slice(2).map(input => input.value), [0, 0]);
    assert.equal(buttons[1].button, 3);
    assert.equal(buttons[1].pressed, false);
});

test('stick and trigger update only their intent values', () => {
    const gamepad = makeGamepad(0, [0, 1, 0, 0]);
    gamepad.buttons[7] = {value: .65, pressed: true};
    const {stage, Chromite} = createExample([gamepad]);
    const chromite = stage.chromite;

    stage.draw({});
    assert.equal(chromite.intent.speed, .65);
    assert.equal(chromite.intent.heading, Math.PI / 2);
    for (let i = 0; i < 10; i++) {
        Chromite.prototype.update.call(chromite);
    }

    gamepad.buttons[7] = {value: .25, pressed: false};
    gamepad.axes[2] = 1;
    drawFrames(stage, 10);
    assert.equal(chromite.intent.speed, .25);
    assert.equal(chromite.intent.heading, Math.PI / 2);
    assert.equal(chromite.intent.remaining, 150);
    assert.equal(stage.rightTriggerValue, .25);

    gamepad.axes = [1, -1, 1, 0];
    drawFrames(stage, 10);
    assert.equal(chromite.intent.speed, .25);
    assert.equal(chromite.intent.heading, -Math.PI / 4);
    assert.equal(chromite.intent.remaining, 150);

    gamepad.buttons[7] = {value: 0, pressed: false};
    drawFrames(stage, 10);
    assert.equal(chromite.intent.speed, .3);
    assert.equal(chromite.intent.heading, -Math.PI / 4);

    const lastIntent = chromite.intent;
    gamepad.axes = [0, 0, 1, 0];
    drawFrames(stage, 10);
    assert.equal(chromite.intent, lastIntent);

    chromite.setIntent({speed: 0, angle: 90, duration: 10});
    gamepad.axes = [1, 0, 1, 0];
    drawFrames(stage, 10);
    assert.equal(chromite.intent.speed, 0);
    assert.equal(chromite.intent.heading, 0);
    assert.equal(chromite.intent.remaining, 150);
});

test('gamepad intent expires and disconnect restores wandering', () => {
    const gamepad = makeGamepad(0, [-1, 0, 0, 0]);
    const gamepads = [gamepad];
    const {stage, Chromite, dispatchGamepad} = createExample(gamepads);
    const chromite = stage.chromite;

    stage.draw({});
    assert.equal(chromite.intent.speed, .3);
    assert.equal(chromite.intent.heading, Math.PI);
    for (let i = 0; i < 150; i++) {
        Chromite.prototype.update.call(chromite);
    }
    assert.equal(chromite.intent, null);
    const currentHeading = chromite.point.radians;
    gamepad.buttons[7] = {value: .8, pressed: true};
    drawFrames(stage, 20);
    assert.equal(chromite.intent.speed, .8);
    assert.ok(Math.abs(chromite.intent.heading - currentHeading) < 1e-10);

    gamepad.axes = [0, -1, 0, 0];
    drawFrames(stage, 10);
    assert.equal(chromite.intent.speed, .8);
    assert.equal(chromite.intent.heading, -Math.PI / 2);
    gamepads[0] = null;
    dispatchGamepad('gamepaddisconnected', gamepad);
    assert.equal(chromite.intent, null);
    assert.equal(stage.rightTriggerValue, 0);
});
