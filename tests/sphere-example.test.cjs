const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../theatre/sphere-example.js'), 'utf8');

function createExample() {
    const listeners = {};
    const bounds = {left: 70, top: 25, width: 500, height: 300};
    const canvas = {
        width: 800,
        height: 600,
        getBoundingClientRect: () => bounds,
        addEventListener(type, handler) { listeners[type] = handler; },
        setPointerCapture(id) { this.capturedPointer = id; }
    };

    class Stage {
        constructor() {
            this.center = {
                copy: () => ({
                    x: 400, y: 300,
                    update(values) { Object.assign(this, values); return this; }
                })
            };
            this.dragging = {add() {}};
        }

        static announce() {
            const stage = new this();
            stage.canvas = canvas;
            stage.mounted();
            return stage;
        }
    }

    const context = {Stage};
    vm.runInNewContext(source, context, {filename: 'sphere-example.js'});

    function emit(type, x, y, button = 2) {
        listeners[type]({
            clientX: bounds.left + x * bounds.width / canvas.width,
            clientY: bounds.top + y * bounds.height / canvas.height,
            button,
            pointerId: 7
        });
    }

    return {stage: context.stage, canvas, emit};
}

function closeTo(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
}

test('right-drag rotation follows the sphere at different positions and canvas scales', () => {
    const {stage, canvas, emit} = createExample();
    stage.sphere.radius = 100;
    let referenceRotation;

    for (const [x, y] of [[400, 300], [620, 100], [180, 470]]) {
        Object.assign(stage.sphere, {x, y});
        stage.q = [1, 0, 0, 0];

        emit('pointerdown', x, y);
        assert.equal(canvas.capturedPointer, 7);
        Array.from(stage.last).forEach((value, i) => closeTo(value, [0, 0, 1][i]));

        emit('pointermove', x + 30, y - 40);
        Array.from(stage.last).forEach((value, i) => closeTo(value, [0.3, 0.4, Math.sqrt(0.75)][i]));
        const rotation = Array.from(stage.q);
        if (referenceRotation) {
            rotation.forEach((value, i) => closeTo(value, referenceRotation[i]));
        } else {
            referenceRotation = rotation;
            assert.notEqual(rotation[0], 1);
        }
        emit('pointerup', x + 30, y - 40);
        assert.equal(stage.last, null);
    }
});

test('only right-drag starts rotation and captured drags can continue outside the sphere', () => {
    const {stage, emit} = createExample();
    Object.assign(stage.sphere, {x: 150, y: 120, radius: 100});

    emit('pointerdown', 150, 120, 0);
    emit('pointermove', 180, 120, 0);
    assert.equal(stage.last, null);
    assert.deepEqual(Array.from(stage.q), [1, 0, 0, 0]);

    emit('pointerdown', 150, 120);
    emit('pointermove', 350, 120);
    Array.from(stage.last).forEach((value, i) => closeTo(value, [1, 0, 0][i]));
    assert.notEqual(stage.q[0], 1);
    emit('pointercancel', 350, 120);
    assert.equal(stage.last, null);
});
