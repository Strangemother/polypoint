const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function createExample() {
    class Stage {
        constructor() { this.dragging = {add() {}}; this.keyboard = {wake() {}}; }
        static go() {
            const stage = new this();
            stage.mounted();
            return stage;
        }
    }

    const context = {
        Stage,
        Polypoint: {head: {
            install() {}, mixin() {}, deferredProp() {}, lazierProp() {}, add() {},
            installFunctions(name, methods) {
                if (name === 'Point') {
                    Object.assign(vm.runInContext('Point.prototype', context), methods);
                }
            }
        }}
    };
    context.window = context;
    vm.createContext(context);
    for (const file of ['point_src/compass.js', 'point_src/relative-xy.js',
        'point_src/point.js', 'point_src/pointlistgenerator.js', 'point_src/pointlist.js', 'point_src/point-content.js',
        'point_src/split.js', 'point_src/functions/clamp.js', 'theatre/basic-2d-robot.js']) {
        vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
    }
    return context.stage;
}

function closeTo(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
}

function checkWheels(stage) {
    const {body, wheels, wheelSpacing} = stage;
    for (const [index, side] of [[0, 1], [1, -1]]) {
        closeTo(wheels[index].x, body.x - side * Math.sin(body.radians) * wheelSpacing / 2);
        closeTo(wheels[index].y, body.y + side * Math.cos(body.radians) * wheelSpacing / 2);
        closeTo(Math.cos(wheels[index].radians), -Math.cos(body.radians));
        closeTo(Math.sin(wheels[index].radians), -Math.sin(body.radians));
    }
}

test('equal wheel speeds move along the body heading, including in reverse', () => {
    const stage = createExample();
    stage.updateWheelSpeeds = () => {};
    checkWheels(stage);
    stage.body.radians = Math.PI / 2;
    stage.wheels[0].speed = stage.wheels[1].speed = 2;
    stage.moveRobot();
    closeTo(stage.body.x, 200);
    closeTo(stage.body.y, 202);
    closeTo(stage.body.radians, Math.PI / 2);
    checkWheels(stage);

    stage.wheels[0].speed = stage.wheels[1].speed = -2;
    stage.moveRobot();
    closeTo(stage.body.x, 200);
    closeTo(stage.body.y, 200);
    checkWheels(stage);
});

test('opposite wheel speeds rotate in place and keep the axle attached', () => {
    const stage = createExample();
    stage.updateWheelSpeeds = () => {};
    stage.wheels[0].speed = 1;
    stage.wheels[1].speed = -1;
    stage.moveRobot();
    closeTo(stage.body.x, 200);
    closeTo(stage.body.y, 200);
    closeTo(stage.body.radians, -2 / stage.wheelSpacing);
    checkWheels(stage);
    assert.equal(stage.wheels[0].speed, 1);
    assert.equal(stage.wheels[1].speed, -1);
});

test('unequal speeds follow a circular arc around the stationary wheel', () => {
    const stage = createExample();
    stage.updateWheelSpeeds = () => {};
    stage.wheels[0].speed = 0;
    stage.wheels[1].speed = 1;
    stage.moveRobot();
    const turn = 1 / stage.wheelSpacing;
    closeTo(stage.body.x, 200 + stage.wheelSpacing / 2 * Math.sin(turn));
    closeTo(stage.body.y, 200 + stage.wheelSpacing / 2 * (1 - Math.cos(turn)));
    closeTo(stage.body.radians, turn);
    closeTo(stage.wheels[0].x, 200);
    closeTo(stage.wheels[0].y, 225);
    checkWheels(stage);
});

test('the other stationary wheel remains fixed while turning the opposite way', () => {
    const stage = createExample();
    stage.updateWheelSpeeds = () => {};
    stage.wheels[0].speed = 1;
    stage.wheels[1].speed = 0;
    for (let i = 0; i < 100; i++) stage.moveRobot();
    closeTo(stage.body.radians, -2);
    closeTo(stage.wheels[1].x, 200);
    closeTo(stage.wheels[1].y, 175);
    checkWheels(stage);
});

test('the keyboard accelerates both wheels and moves the robot', () => {
    const stage = createExample();
    stage.onKeydown({key: 'ArrowUp'});
    stage.step();
    closeTo(stage.wheels[0].speed, .05 * .994);
    closeTo(stage.wheels[1].speed, .05 * .994);
    closeTo(stage.body.x, 200 + .05 * .994);
    closeTo(stage.body.y, 200);
    closeTo(stage.body.radians, 0);
    checkWheels(stage);
});

test('stopped wheels follow a dragged or rotated body without moving it', () => {
    const stage = createExample();
    stage.updateWheelSpeeds = () => {};
    stage.wheels[0].speed = stage.wheels[1].speed = 0;
    stage.body.x = 50;
    stage.body.y = 80;
    stage.body.radians = -1;
    stage.moveRobot();
    closeTo(stage.body.x, 50);
    closeTo(stage.body.y, 80);
    closeTo(stage.body.radians, -1);
    checkWheels(stage);
});

test('wheel tread follows each wheel through acceleration, stopping, and reverse', () => {
    const stage = createExample();
    let dash = [8, 3];
    let saved;
    const offsets = [[], []];
    const ctx = {
        lineCap: 'square',
        lineDashOffset: 2,
        save() { saved = {dash: [...dash], lineCap: this.lineCap, lineDashOffset: this.lineDashOffset}; },
        restore() { dash = saved.dash; this.lineCap = saved.lineCap; this.lineDashOffset = saved.lineDashOffset; },
        beginPath() {},
        setLineDash(value) { dash = Array.from(value); }
    };
    stage.clear = () => {};
    stage.body.pen = {indicator() {
        assert.deepEqual(dash, [8, 3]);
        assert.equal(ctx.lineCap, 'square');
        assert.equal(ctx.lineDashOffset, 2);
    }};
    stage.wheels.forEach((wheel, index) => {
        wheel.project = () => ({pen: {line(drawingContext, target, color, width) {
            assert.deepEqual(dash, [0, 5, 2]);
            assert.equal(ctx.lineCap, 'round');
            assert.equal(target, wheel);
            assert.equal(color, '#336600');
            assert.equal(width, 4);
            offsets[index].push(ctx.lineDashOffset);
        }}});
    });

    stage._speedA = 1;
    stage._speedB = -.5;
    stage.draw(ctx);
    stage._speedA = 2;
    stage._speedB = 0;
    stage.draw(ctx);
    stage._speedA = 0;
    stage.draw(ctx);
    stage._speedA = -1;
    stage._speedB = .5;
    stage.draw(ctx);
    const friction = .994;
    [-friction, -3 * friction, -3 * friction, -2 * friction]
        .forEach((value, i) => closeTo(offsets[0][i], value));
    [.5 * friction, .5 * friction, .5 * friction, 0]
        .forEach((value, i) => closeTo(offsets[1][i], value));
    assert.deepEqual(dash, [8, 3]);
    assert.equal(ctx.lineCap, 'square');
    assert.equal(ctx.lineDashOffset, 2);
});
