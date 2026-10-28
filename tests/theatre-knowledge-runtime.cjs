const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const examples = JSON.parse(fs.readFileSync(0, 'utf8'));

class EventTarget {
    constructor() {
        this.listeners = {};
    }

    addEventListener(name, handler) {
        (this.listeners[name] ||= []).push(handler);
    }

    removeEventListener(name, handler) {
        this.listeners[name] = (this.listeners[name] || []).filter(item => item !== handler);
    }

    dispatchEvent(event) {
        event.target ||= this;
        event.currentTarget = this;
        for (const handler of this.listeners[event.type] || []) handler.call(this, event);
        return true;
    }
}

function run(example) {
    const calls = [];
    let canvas;
    const context = new Proxy({}, {
        get(target, name) {
            if (name === 'canvas') return canvas;
            if (name === 'measureText') return text => ({width: String(text).length * 8});
            if (name === 'createLinearGradient' || name === 'createRadialGradient') {
                return () => ({addColorStop() {}});
            }
            if (name === 'getLineDash') return () => [];
            if (name === 'isPointInPath' || name === 'isPointInStroke') return () => false;
            if (name in target) return target[name];
            return (...args) => calls.push([name, ...args]);
        },
        set(target, name, value) {
            target[name] = value;
            return true;
        }
    });

    class Canvas extends EventTarget {
        constructor() {
            super();
            this.width = 800;
            this.height = 600;
            this.style = {};
        }

        getBoundingClientRect() {
            return {width: 800, height: 600, left: 0, top: 0, right: 800, bottom: 600};
        }

        getContext() { return context; }
        setAttribute() {}
    }

    canvas = new Canvas();
    const events = new EventTarget();
    const frames = [];
    let time = 0;
    const sandbox = {
        URL,
        console: {
            log() {},
            warn() {},
            error(...args) { throw new Error(`console.error: ${args.join(' ')}`); }
        },
        HTMLElement: Canvas,
        HTMLCanvasElement: Canvas,
        CustomEvent: class {
            constructor(type, options = {}) {
                this.type = type;
                this.detail = options.detail;
            }
        },
        document: {
            currentScript: {src: 'https://example.test/point_src/core/head.js', dataset: {}, attributes: {}},
            getElementById: () => canvas,
            querySelector: () => canvas,
            addEventListener: events.addEventListener.bind(events)
        },
        performance: {now: () => (time += 16)},
        requestAnimationFrame: callback => (frames.push(callback), frames.length),
        cancelAnimationFrame() {},
        setTimeout: callback => (callback(), 1),
        clearTimeout() {},
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
        dispatchEvent: events.dispatchEvent.bind(events)
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);

    for (const file of example.files) {
        sandbox.document.currentScript.src = `https://example.test/${file.name}`;
        vm.runInContext(fs.readFileSync(file.path, 'utf8'), sandbox, {filename: file.name, timeout: 5000});
    }
    vm.runInContext(example.source, sandbox, {filename: example.topic, timeout: 5000});

    const emit = (type, x, y, buttons = 0) => canvas.dispatchEvent({
        type, x, y, offsetX: x, offsetY: y, clientX: x, clientY: y, buttons, button: 0,
        preventDefault() {}, stopPropagation() {}
    });
    emit('mousemove', 200, 200);
    emit('mousedown', 200, 200, 1);
    emit('mousemove', 210, 210, 1);
    emit('mouseup', 210, 210);
    emit('click', 210, 210);
    for (let i = 0; i < 3 && frames.length; i++) frames.shift()();

    assert(calls.some(call => ['stroke', 'fill', 'fillRect', 'fillText', 'strokeText'].includes(call[0])),
        'no drawing operation was invoked');
    assert(frames.length, 'no continuing animation frame was scheduled');

    if (example.topic === 'example-click') {
        emit('click', 0, 90);
        assert.equal(sandbox.stage.clickPoint.x, 0);
        assert.equal(sandbox.stage.clickPoint.y, 90);
    }
    if (example.topic === 'example-line') {
        const point = sandbox.stage.line.a;
        const x = point.x, y = point.y;
        emit('mousemove', x, y);
        emit('mousedown', x, y, 1);
        emit('mousemove', x + 50, y + 40, 1);
        emit('mouseup', x + 50, y + 40);
        assert.equal(point.x, x + 50);
        assert.equal(point.y, y + 40);
    }
    if (example.topic === 'example-projection') {
        sandbox.stage.perspective = false;
        sandbox.stage.step();
        assert(sandbox.stage.spunPointsA.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
        assert(sandbox.stage.spunPointsA.some(point => point.x > 0 && point.y > 0));
    }
    if (example.topic === 'example-random-points') {
        const points = sandbox.stage.points;
        points.each.radius = 10;
        assert(points.every(point => point.radius === 10));
        points.each.radius = (point, index) => point.radius + index;
        assert(points.every((point, index) => point.radius === 10 + index));
        assert.equal(points.copy()[0], points[0]);
        assert.notEqual(points.copy(true)[0], points[0]);
    }
    if (example.topic === 'guide-imports-starter') {
        const point = sandbox.stage.point;
        const x = point.x, y = point.y;
        emit('mousemove', x, y);
        emit('mousedown', x, y, 1);
        emit('mousemove', x + 30, y + 20, 1);
        emit('mouseup', x + 30, y + 20);
        assert.equal(point.x, x + 30);
        assert.equal(point.y, y + 20);
        assert(point.rotation > 0);
    }
}

let failures = 0;
for (const example of examples) {
    try {
        run(example);
        console.log(`PASS ${example.topic}`);
    } catch (error) {
        failures++;
        console.error(`FAIL ${example.topic}: ${error.stack}`);
    }
}
if (failures) process.exitCode = 1;
