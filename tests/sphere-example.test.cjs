const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../theatre/sphere-example.js'), 'utf8');

function createExample(exampleSource = source) {
    const listeners = {};
    const bounds = {left: 70, top: 25, width: 500, height: 300};
    const canvas = {
        width: 800,
        height: 600,
        getBoundingClientRect: () => bounds,
        addEventListener(type, handler) { listeners[type] = handler; },
        setPointerCapture(id) { this.capturedPointer = id; }
    };

    class MockPoint {
        constructor() {
            this._values = {x: 400, y: 300};
            this.dirty = true;
        }

        get x() { return this._values.x; }
        set x(value) { this._values.x = value; this.dirty = true; }
        get y() { return this._values.y; }
        set y(value) { this._values.y = value; this.dirty = true; }
        get radius() { return this._values.radius; }
        set radius(value) { this._values.radius = value; this.dirty = true; }
        get wasDirty() {
            const dirty = this.dirty;
            this.dirty = false;
            return dirty;
        }
        update(values) { Object.assign(this, values); return this; }
    }

    class MockPath2D {
        constructor() { this.commands = []; }
        moveTo(...args) { this.commands.push(['moveTo', ...args]); }
        lineTo(...args) { this.commands.push(['lineTo', ...args]); }
        bezierCurveTo(...args) { this.commands.push(['bezierCurveTo', ...args]); }
    }

    class Stage {
        constructor() {
            this.center = {
                copy: () => new MockPoint()
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

    const context = {Stage, Path2D: MockPath2D};
    vm.runInNewContext(exampleSource, context, {filename: 'sphere-example.js'});

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

function closeTo(actual, expected, tolerance = 1e-12) {
    assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
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
        Array.from(stage.last).forEach((value, i) => closeTo(value, [x, -y][i]));

        emit('pointermove', x + 30, y - 40);
        Array.from(stage.last).forEach((value, i) => closeTo(value, [x + 30, 40 - y][i]));
        const rotation = Array.from(stage.q);
        rotation.forEach((value, i) => closeTo(value,
            [Math.cos(0.25), -0.8 * Math.sin(0.25), 0.6 * Math.sin(0.25), 0][i]));
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
    Array.from(stage.last).forEach((value, i) => closeTo(value, [350, -120][i]));
    assert.notEqual(stage.q[0], 1);
    emit('pointercancel', 350, 120);
    assert.equal(stage.last, null);
});

test('radial right-drags keep rotating beyond the rim and reverse without a snap', () => {
    for (const [dx, dy] of [[1, 0], [0, -1], [0.6, 0.8]]) {
        const {stage, emit} = createExample();
        Object.assign(stage.sphere, {x: 150, y: 120, radius: 100});
        const move = distance => emit('pointermove', 150 + dx * distance, 120 + dy * distance);
        const distances = [0, 50, 70, 90, 99, 100, 101, 120, 200, 400, 800, 1600, 3200, 6400];
        emit('pointerdown', 150, 120);
        for (const distance of distances.slice(1)) {
            stage.sphere.dirty = false;
            move(distance);
            const half = distance / stage.sphere.radius / 2;
            Array.from(stage.q).forEach((value, i) => closeTo(value,
                [Math.cos(half), dy * Math.sin(half), dx * Math.sin(half), 0][i]));
            closeTo(Math.hypot(...stage.q), 1);
            assert.equal(stage.sphere.dirty, true);
        }
        const stationary = Array.from(stage.q);
        stage.sphere.dirty = false;
        move(6400);
        assert.deepEqual(Array.from(stage.q), stationary);
        assert.equal(stage.sphere.dirty, false);
        for (const distance of distances.slice(0, -1).reverse()) move(distance);
        Array.from(stage.q).forEach((value, i) => closeTo(value, [1, 0, 0, 0][i]));
        emit('lostpointercapture', 150, 120);
        assert.equal(stage.last, null);
        const released = Array.from(stage.q);
        move(200);
        assert.deepEqual(Array.from(stage.q), released);
    }
});

test('right-drag rotation has constant sensitivity inside and far outside the sphere', () => {
    const {stage, emit} = createExample();
    Object.assign(stage.sphere, {x: 150, y: 120, radius: 100});
    const step = 0.001;
    for (const boundary of [0, 100 * Math.SQRT1_2, 100, 1000, 10000]) {
        emit('pointerdown', 150 + boundary - step, 120);
        const angles = [];
        for (const distance of [boundary, boundary + step]) {
            const previous = Array.from(stage.q);
            emit('pointermove', 150 + distance, 120);
            const delta = stage.mul(stage.q, [previous[0], -previous[1], -previous[2], -previous[3]]);
            angles.push(2 * Math.atan2(Math.hypot(...delta.slice(1)), delta[0]));
        }
        angles.forEach(angle => closeTo(angle, step / stage.sphere.radius));
        emit('pointerup', 150 + boundary + step, 120);
    }
});

test('continuous radial right-drag rotation is independent of event frequency', () => {
    for (const radius of [50, 200]) {
        const rotations = [];
        for (const steps of [1, 100]) {
            const {stage, emit} = createExample();
            Object.assign(stage.sphere, {x: 450, y: 320, radius});
            emit('pointerdown', 450, 320);
            for (let i = 1; i <= steps; i++) {
                emit('pointermove', 450 + 1440 * i / steps, 320 - 1920 * i / steps);
            }
            rotations.push(Array.from(stage.q));
        }
        const half = 2400 / radius / 2;
        const expected = [Math.cos(half), -0.8 * Math.sin(half), 0.6 * Math.sin(half), 0];
        rotations.forEach(rotation => rotation.forEach((value, i) => closeTo(value, expected[i], 1e-10)));
    }
});

test('off-center right-drags retain the trackball twist axis at every orientation', () => {
    const {stage, emit} = createExample();
    Object.assign(stage.sphere, {x: 400, y: 300, radius: 100});
    const half = 0.05;
    for (const offset of [-300, -100, -40, 40, 100, 300]) {
        const y = -offset / 100;
        const depth = d => d <= Math.SQRT1_2 ? Math.sqrt(1 - d*d) : 0.5/d;
        const z = depth(Math.abs(y));
        const nextZ = depth(Math.hypot(0.1, y));
        const axis = [y * (nextZ - z), z * 0.1, -y * 0.1];
        const length = Math.hypot(...axis);
        const expected = [Math.cos(half), ...axis.map(value => value * Math.sin(half) / length)];
        for (const initial of [
            [1, 0, 0, 0],
            [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
            [Math.SQRT1_2, 0, Math.SQRT1_2, 0],
            [Math.SQRT1_2, 0, 0, Math.SQRT1_2]
        ]) {
            stage.q = initial.slice();
            emit('pointerdown', 400, 300 + offset);
            emit('pointermove', 410, 300 + offset);
            const delta = stage.mul(stage.q, [initial[0], -initial[1], -initial[2], -initial[3]]);
            Array.from(delta).forEach((value, i) => closeTo(value, expected[i]));
            assert.ok(Math.abs(delta[3]) > 0.01, 'off-center drag must allow Z-axis twist');
            closeTo(Math.hypot(...stage.q), 1);
            emit('pointerup', 410, 300 + offset);
        }
    }
});

test('pole markers, both tips, and the internal line rotate with the sphere', () => {
    const {stage} = createExample();
    Object.assign(stage.sphere, {x: 150, y: 120, radius: 100});
    const zAngle = Math.PI / 6;
    const xAngle = Math.PI / 4;
    const cz = Math.cos(zAngle / 2), sz = Math.sin(zAngle / 2);
    const cx = Math.cos(xAngle / 2), sx = Math.sin(xAngle / 2);
    const calls = [];
    const ctx = {};
    for (const method of ['beginPath', 'moveTo', 'lineTo', 'bezierCurveTo', 'stroke', 'arc', 'fill', 'save', 'restore', 'setLineDash']) {
        ctx[method] = (...args) => calls.push([method, ...args]);
    }

    for (const q of [[1, 0, 0, 0], [cz * cx, cz * sx, sz * sx, sz * cx]]) {
        stage.q = q;
        calls.length = 0;
        stage.drawSphere(ctx);

        const axis = calls.filter(call => call[0] === 'moveTo' || call[0] === 'lineTo').slice(0, 6);
        const markers = calls.filter(call => call[0] === 'arc');
        assert.equal(markers.length, 2);
        assert.equal(calls.filter(call => call[0] === 'fill').length, 2);

        function expected(y) {
            const rotated = q[0] === 1
                ? [0, y, 0]
                : [-Math.sin(zAngle) * Math.cos(xAngle) * y,
                    Math.cos(zAngle) * Math.cos(xAngle) * y,
                    Math.sin(xAngle) * y];
            const scale = 3.6 / (3.6 - rotated[2] * 0.34);
            return [150 + rotated[0] * 99 * scale, 120 - rotated[1] * 99 * scale];
        }

        for (const [i, sign] of [-1, 1].entries()) {
            const marker = expected(sign);
            closeTo(markers[i][1], marker[0]);
            closeTo(markers[i][2], marker[1]);
            closeTo(markers[i][3], 99 * .1 * .2);
        }
        assert.equal(axis.length, 6);
        for (const [i, y] of [-1, 1, -1.24, -1, 1.24, 1].entries()) {
            const endpoint = expected(y);
            closeTo(axis[i][1], endpoint[0]);
            closeTo(axis[i][2], endpoint[1]);
        }
    }
});

test('each pole tip is split at the outline while the internal line stays whole', () => {
    const {stage} = createExample();
    Object.assign(stage.sphere, {x: 260, y: 180, radius: 80});
    const strokes = [];
    const ctx = {};
    let path, dash = [];
    const savedDashes = [];
    ctx.beginPath = () => { path = []; };
    ctx.moveTo = (x, y) => path.push([x, y]);
    ctx.lineTo = (x, y) => path.push([x, y]);
    for (const method of ['bezierCurveTo', 'arc', 'fill']) {
        ctx[method] = () => {};
    }
    ctx.save = () => savedDashes.push(dash.slice());
    ctx.restore = () => { dash = savedDashes.pop(); };
    ctx.setLineDash = value => { dash = Array.from(value); };
    ctx.stroke = () => strokes.push({color: ctx.strokeStyle, width: ctx.lineWidth, path, dash: dash.slice()});

    const bright = 'rgba(166,222,239,.38)';
    const dim = 'rgba(166,222,239,.076)';
    const zAngle = Math.PI / 6;
    for (const xAngle of [0, Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3]) {
        const cz = Math.cos(zAngle / 2), sz = Math.sin(zAngle / 2);
        const cx = Math.cos(xAngle / 2), sx = Math.sin(xAngle / 2);
        stage.q = [cz * cx, cz * sx, sz * sx, sz * cx];
        strokes.length = 0;
        stage.drawSphere(ctx);

        const project = y => {
            const x = -Math.sin(zAngle) * Math.cos(xAngle) * y;
            const vertical = Math.cos(zAngle) * Math.cos(xAngle) * y;
            const z = Math.sin(xAngle) * y;
            const scale = 3.6 / (3.6 - z * 0.34);
            return [260 + x * 79 * scale, 180 - vertical * 79 * scale];
        };
        const internal = strokes.filter(stroke => stroke.width === 1);
        assert.equal(internal.length, 1);
        assert.equal(internal[0].color, 'rgb(166,222,239)');
        assert.deepEqual(internal[0].dash, [6, 4]);
        assert.ok(strokes.filter(stroke => stroke.width !== 1).every(stroke => stroke.dash.length === 0));
        assert.deepEqual(dash, []);
        const poleA = project(-1), poleB = project(1);
        for (const i of [0, 1]) {
            closeTo(internal[0].path[0][i], poleA[i]);
            closeTo(internal[0].path[1][i], poleB[i]);
        }

        const tips = strokes.filter(stroke => stroke.width === 2);
        let next = 0;
        for (const sign of [-1, 1]) {
            const a = project(sign * 1.24), b = project(sign);
            const behind = sign * Math.sin(xAngle) < 0;
            const split = behind && Math.hypot(a[0] - 260, a[1] - 180) > 79;
            const tip = tips.slice(next, next + (split ? 2 : 1));
            next += tip.length;
            assert.deepEqual(tip.map(stroke => stroke.color), split ? [bright, dim] : [behind ? dim : bright]);
            for (const i of [0, 1]) {
                closeTo(tip[0].path[0][i], a[i]);
                closeTo(tip[tip.length - 1].path[1][i], b[i]);
            }
            if (split) {
                const edge = tip[0].path[1];
                closeTo(Math.hypot(edge[0] - 260, edge[1] - 180), 79);
                closeTo(edge[0], tip[1].path[0][0]);
                closeTo(edge[1], tip[1].path[0][1]);
                assert.ok(Math.hypot(b[0] - 260, b[1] - 180) < 79);
            }
        }
        assert.equal(next, tips.length);
    }
    dash = [9, 3];
    strokes.length = 0;
    stage.drawSphere(ctx);
    assert.deepEqual(strokes.find(stroke => stroke.width === 1).dash, [6, 4]);
    assert.ok(strokes.filter(stroke => stroke.width !== 1).every(stroke => stroke.dash.join(',') === '9,3'));
    assert.deepEqual(dash, [9, 3]);
});

test('pole markers retain their colors, dim behind the sphere, and render in depth order', () => {
    const {stage} = createExample();
    Object.assign(stage.sphere, {x: 150, y: 120, radius: 100});
    const markers = [];
    const ctx = {fillStyle: 'original'};
    let arc, savedState;
    for (const method of ['beginPath', 'moveTo', 'lineTo', 'bezierCurveTo', 'stroke', 'setLineDash']) {
        ctx[method] = () => {};
    }
    ctx.arc = (x, y, radius) => { arc = [x, y, radius]; };
    ctx.fill = () => markers.push({arc, color: ctx.fillStyle, alpha: ctx.globalAlpha});
    ctx.save = () => { savedState = {fillStyle: ctx.fillStyle, globalAlpha: ctx.globalAlpha}; };
    ctx.restore = () => { Object.assign(ctx, savedState); };

    for (const angle of [0, Math.PI / 4, -Math.PI / 4, -Math.PI / 2]) {
        stage.q = [Math.cos(angle / 2), Math.sin(angle / 2), 0, 0];
        markers.length = 0;
        stage.drawSphere(ctx);

        assert.equal(markers.length, 2);
        const signs = angle < 0 ? [1, -1] : [-1, 1];
        for (const [i, sign] of signs.entries()) {
            const z = sign * Math.sin(angle);
            const scale = 3.6 / (3.6 - z * 0.34);
            closeTo(markers[i].arc[0], 150);
            closeTo(markers[i].arc[1], 120 - sign * Math.cos(angle) * 99 * scale);
            closeTo(markers[i].arc[2], 99 * .1 * .2);
            assert.equal(markers[i].color, sign === -1 ? '#990000' : stage.sphere.color);
            assert.equal(markers[i].alpha, z < 0 ? .18 : .9);
        }
        assert.equal(ctx.fillStyle, 'original');
        assert.equal(ctx.globalAlpha, 1);
    }
});

for (const direction of ['latitude', 'longitude']) test(`smooth ${direction} circles use four cubic segments and approximate the projection`, () => {
    const {stage} = createExample();
    const lineCount = 5, r = 200, cx = 315, cy = 270;
    const half = Math.PI / 8;
    const rotations = [
        [1, 0, 0, 0],
        [Math.cos(half), Math.sin(half), 0, 0],
        [Math.cos(half), 0, Math.sin(half), 0],
        [Math.cos(half) ** 2, Math.sin(half) * Math.cos(half),
            Math.sin(half) * Math.cos(half), Math.sin(half) ** 2]
    ];
    for (let i = 1; i <= 12; i++) {
        const x = Math.sin(i * 1.17), y = Math.cos(i * 2.03);
        const z = Math.sin(i * .83), w = Math.cos(i * .59);
        const length = Math.hypot(w, x, y, z);
        rotations.push([w / length, x / length, y / length, z / length]);
    }

    for (const q of rotations) {
        stage.q = q;
        const create = direction === 'latitude' ? stage.createBezierLatitudes : stage.createBezierLongitudes;
        const strokes = Array.from(create.call(stage, {cx, cy, r, lineCount}), entry => {
            let cursor;
            const segments = [];
            for (const [command, ...args] of entry.path.commands) {
                if (command === 'moveTo') cursor = args;
                else {
                    const end = args.slice(4, 6);
                    segments.push([cursor, args.slice(0, 2), args.slice(2, 4), end]);
                    cursor = end;
                }
            }
            return {segments, index: entry.index, alpha: entry.front ? 1 : .2};
        });
        assert.equal(strokes.reduce((count, stroke) => count + stroke.segments.length, 0), 4 * lineCount);

        for (let k = 1; k <= lineCount; k++) {
            const lat = -Math.PI / 2 + k * Math.PI / (lineCount + 1);
            const meridian = (k - 1) * Math.PI / lineCount;
            const samples = [];
            for (let i = 0; i < 3600; i++) {
                const lon = i * 2 * Math.PI / 3600;
                const point = direction === 'latitude'
                    ? [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]
                    : [Math.cos(lon) * Math.cos(meridian), Math.sin(lon), Math.cos(lon) * Math.sin(meridian)];
                const [x, y, z] = stage.rotate(point);
                const scale = 3.6 / (3.6 - z * .34);
                samples.push([cx + x * r * scale, cy - y * r * scale, z]);
            }
            const latitudeStrokes = strokes.filter(stroke => stroke.index === k);
            assert.equal(latitudeStrokes.reduce((count, stroke) => count + stroke.segments.length, 0), 4);
            for (const stroke of latitudeStrokes) {
                assert.ok(stroke.alpha === 1 || stroke.alpha === .2);
                for (const segment of stroke.segments) {
                    for (let i = 0; i <= 8; i++) {
                        const t = i / 8, s = 1 - t;
                        const x = s ** 3 * segment[0][0] + 3 * s ** 2 * t * segment[1][0]
                            + 3 * s * t ** 2 * segment[2][0] + t ** 3 * segment[3][0];
                        const y = s ** 3 * segment[0][1] + 3 * s ** 2 * t * segment[1][1]
                            + 3 * s * t ** 2 * segment[2][1] + t ** 3 * segment[3][1];
                        let nearest = Infinity;
                        for (const sample of samples) {
                            if ((sample[2] >= 0) !== (stroke.alpha === 1)) continue;
                            nearest = Math.min(nearest, Math.hypot(x - sample[0], y - sample[1]));
                        }
                        assert.ok(nearest < 1, `${direction} ${k}: projected curve is ${nearest}px from its ${stroke.alpha} side`);
                    }
                }
            }
        }
    }
});

test('wave latitudes preserve the sampled waveform and front/back paths', () => {
    const {stage} = createExample();
    const project = p => p;
    const options = {lineCount: 2, waveformAmp: .02, startSliceAngle: 30, endSliceAngle: 200};
    const strokes = stage.createWaveLatitudes(project, options);
    assert.equal(strokes.length, 4);
    for (let k = 1; k <= options.lineCount; k++) {
        const lat = -Math.PI / 2 + k * Math.PI / (options.lineCount + 1);
        const line = [];
        for (let i = options.startSliceAngle; i <= options.endSliceAngle; i++) {
            const lon = i * 2 * Math.PI / 280;
            const wave = options.waveformAmp * (
                Math.sin(lon * (3 + k % 4) + Math.floor(Math.cos(lat)) - k * 1.618 * .01)
                + .03 * Math.sin(lon * (3 + k % 5 + Math.floor(50 * Math.cos(lat))) - k * 1.618 * .01)
            );
            const t = lat + wave;
            line.push([Math.cos(t) * Math.cos(lon), Math.sin(t), Math.cos(t) * Math.sin(lon)]);
        }
        for (const [j, front] of [false, true].entries()) {
            const expected = [];
            let drawing = false;
            for (const point of line) {
                if ((point[2] >= 0) === front) {
                    expected.push([drawing ? 'lineTo' : 'moveTo', point[0], point[1]]);
                    drawing = true;
                } else drawing = false;
            }
            const stroke = strokes[(k - 1) * 2 + j];
            assert.deepEqual(stroke.path.commands, expected);
            assert.equal(stroke.index, k);
            assert.equal(stroke.front, front);
        }
    }
});

test('sampled longitude circles pass through both poles and support waves and partial slices', () => {
    const {stage} = createExample();
    for (const options of [
        {lineCount: 4, waveformAmp: 0, startSliceAngle: 0, endSliceAngle: 280},
        {lineCount: 4, waveformAmp: .02, startSliceAngle: 21, endSliceAngle: 120}
    ]) {
        const points = [];
        const paths = stage.createWaveLongitudes(point => {
            points.push(Array.from(point));
            return point;
        }, options);
        const length = options.endSliceAngle - options.startSliceAngle + 1;
        assert.equal(points.length, options.lineCount * length);
        assert.equal(paths.length, options.lineCount * 2);
        let wavyDeviation = false;
        for (let k = 1; k <= options.lineCount; k++) {
            const meridian = (k - 1) * Math.PI / options.lineCount;
            const line = points.slice((k - 1) * length, k * length);
            for (const [x, y, z] of line) {
                closeTo(Math.hypot(x, y, z), 1);
                const offset = -x * Math.sin(meridian) + z * Math.cos(meridian);
                if (options.waveformAmp === 0) closeTo(offset, 0);
                else if (Math.abs(offset) > .001) wavyDeviation = true;
            }
            if (options.waveformAmp === 0) {
                closeTo(line[70][1], 1);
                closeTo(line[210][1], -1);
            }
            for (const [j, front] of [false, true].entries()) {
                const expected = [];
                let drawing = false;
                for (const point of line) {
                    if ((point[2] >= 0) === front) {
                        expected.push([drawing ? 'lineTo' : 'moveTo', point[0], point[1]]);
                        drawing = true;
                    } else drawing = false;
                }
                const entry = paths[(k - 1) * 2 + j];
                assert.equal(entry.index, k);
                assert.equal(entry.front, front);
                assert.deepEqual(entry.path.commands, expected);
            }
        }
        if (options.waveformAmp !== 0) assert.ok(wavyDeviation);
    }
});

test('drawSphere selects the wave renderer for waves, partial slices, or explicit wave mode', () => {
    const variants = [
        [source, 'bezier'],
        [source.replace("const latitudeMode = 'bezier'", "const latitudeMode = 'wave'"), 'wave'],
        [source.replace('const waveformAmp = 0;', 'const waveformAmp = .02;'), 'wave'],
        [source.replace('const endSliceAngle = 280;', 'const endSliceAngle = 200;'), 'wave']
    ];
    for (const [exampleSource, expected] of variants) {
        const {stage} = createExample(exampleSource);
        let selected;
        stage.createWaveLatitudes = () => { selected = 'wave'; return []; };
        stage.createBezierLatitudes = () => { selected = 'bezier'; return []; };
        const ctx = {};
        for (const method of ['beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill', 'save', 'restore', 'setLineDash']) {
            ctx[method] = () => {};
        }
        stage.drawSphere(ctx);
        assert.equal(selected, expected);
    }
});

for (const [mode, exampleSource] of [
    ['bezier', source],
    ['wave', source.replace("const latitudeMode = 'bezier'", "const latitudeMode = 'wave'")]
]) {
    test(`${mode} grid supports both directions and caches changes to options`, () => {
        const {stage} = createExample(exampleSource);
        const builds = {latitude: 0, longitude: 0};
        const generated = {};
        for (const direction of ['latitude', 'longitude']) {
            const method = `create${mode === 'wave' ? 'Wave' : 'Bezier'}${direction === 'latitude' ? 'Latitudes' : 'Longitudes'}`;
            const create = stage[method].bind(stage);
            stage[method] = (...args) => {
                builds[direction]++;
                generated[direction] = create(...args);
                return generated[direction];
            };
        }
        const drawn = [];
        const ctx = {};
        for (const name of ['beginPath', 'moveTo', 'lineTo', 'arc', 'fill', 'save', 'restore', 'setLineDash']) {
            ctx[name] = () => {};
        }
        ctx.stroke = path => {
            if (path) drawn.push({path, alpha: ctx.globalAlpha, width: ctx.lineWidth});
        };
        const draw = () => { drawn.length = 0; stage.drawSphere(ctx); };

        stage.gridDirection = 'latitude';
        draw();
        assert.deepEqual(builds, {latitude: 1, longitude: 0});
        assert.equal(drawn.length, generated.latitude.length);
        stage.gridDirection = 'both';
        draw();
        assert.deepEqual(builds, {latitude: 2, longitude: 1});
        assert.equal(drawn.length, generated.latitude.length + generated.longitude.length);
        const cached = drawn.map(item => item.path);
        for (let i = 0; i < drawn.length; i++) {
            assert.strictEqual(drawn[i].path, stage.gridCache.paths[i].path);
            assert.equal(drawn[i].alpha, stage.gridCache.paths[i].front ? 1 : .2);
            assert.equal(drawn[i].width, stage.gridCache.paths[i].front ? 1.4 : .9);
            if (i > 0) assert.ok(drawn[i - 1].alpha <= drawn[i].alpha);
        }
        draw();
        assert.deepEqual(builds, {latitude: 2, longitude: 1});
        drawn.forEach((item, i) => assert.strictEqual(item.path, cached[i]));

        stage.gridDirection = 'longitude';
        draw();
        assert.deepEqual(builds, {latitude: 2, longitude: 2});
        assert.equal(drawn.length, generated.longitude.length);
        stage.longitudeCount = 3;
        draw();
        assert.deepEqual(builds, {latitude: 2, longitude: 3});
        assert.equal(new Set(generated.longitude.map(entry => entry.index)).size, 3);

        stage.gridDirection = 'both';
        stage.latitudeCount = 3;
        stage.longitudeCount = 4;
        draw();
        assert.deepEqual(builds, {latitude: 3, longitude: 4});
        assert.equal(new Set(generated.latitude.map(entry => entry.index)).size, 3);
        assert.equal(new Set(generated.longitude.map(entry => entry.index)).size, 4);
        stage.q = [Math.cos(.2), Math.sin(.2), 0, 0];
        draw();
        assert.deepEqual(builds, {latitude: 4, longitude: 5});
        stage.latitudeCount = 0;
        stage.longitudeCount = 0;
        draw();
        assert.equal(drawn.length, 0);
        stage.gridDirection = 'invalid';
        assert.throws(draw, /Unknown grid direction: invalid/);
        stage.gridDirection = 'both';
        for (const invalid of [-1, 1.5, Infinity]) {
            stage.longitudeCount = invalid;
            assert.throws(draw, /longitudeCount must be a non-negative integer/);
        }
    });
}

for (const [mode, exampleSource] of [
    ['bezier', source],
    ['wave', source.replace("const latitudeMode = 'bezier'", "const latitudeMode = 'wave'")]
]) {
    test(`${mode} latitude paths are cached until the point or geometry changes`, () => {
        const {stage, emit} = createExample(exampleSource);
        const method = mode === 'wave' ? 'createWaveLatitudes' : 'createBezierLatitudes';
        const create = stage[method].bind(stage);
        let builds = 0;
        stage[method] = (...args) => { builds++; return create(...args); };
        const strokes = [];
        const ctx = {};
        for (const name of ['beginPath', 'moveTo', 'lineTo', 'arc', 'fill', 'save', 'restore', 'setLineDash']) {
            ctx[name] = () => {};
        }
        ctx.stroke = path => {
            if (path) strokes.push({path, color: ctx.strokeStyle, alpha: ctx.globalAlpha, width: ctx.lineWidth});
        };
        const draw = () => {
            strokes.length = 0;
            stage.drawSphere(ctx);
            return strokes.map(stroke => ({...stroke}));
        };

        const first = draw();
        assert.ok(first.length > 0);
        assert.equal(builds, 1);
        assert.equal(stage.sphere.dirty, false);
        const second = draw();
        assert.equal(builds, 1);
        assert.deepEqual(second, first);
        for (let i = 0; i < first.length; i++) {
            assert.strictEqual(second[i].path, first[i].path);
            assert.equal(second[i].alpha, stage.gridCache.paths[i].front ? 1 : .2);
            assert.equal(second[i].width, stage.gridCache.paths[i].front ? 1.4 : .9);
        }

        stage.sphere.color = 'lime';
        const recolored = draw();
        assert.equal(builds, 1);
        assert.ok(recolored.every(stroke => stroke.color === 'lime'));
        assert.strictEqual(recolored[0].path, first[0].path);

        stage.sphere.dirty = true;
        draw();
        assert.equal(builds, 2);
        stage.sphere.x += 30;
        draw();
        assert.equal(builds, 3);
        stage.sphere.radius += 10;
        draw();
        assert.equal(builds, 4);

        emit('pointerdown', stage.sphere.x, stage.sphere.y);
        emit('pointermove', stage.sphere.x + 30, stage.sphere.y - 20);
        assert.equal(stage.sphere.dirty, true);
        draw();
        assert.equal(builds, 5);
        draw();
        assert.equal(builds, 5);

        stage.q = [Math.cos(.2), Math.sin(.2), 0, 0];
        draw();
        assert.equal(builds, 6);
        stage.sphere._values.y += 15;
        draw();
        assert.equal(builds, 7);
        assert.equal(stage.sphere.dirty, false);
    });
}

test('a failed latitude rebuild is retried rather than reusing stale paths', () => {
    const {stage} = createExample();
    const ctx = {};
    for (const name of ['beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill', 'save', 'restore', 'setLineDash']) {
        ctx[name] = () => {};
    }
    stage.drawSphere(ctx);
    const create = stage.createBezierLatitudes.bind(stage);
    stage.sphere.dirty = true;
    stage.createBezierLatitudes = () => { throw new Error('path creation failed'); };
    assert.throws(() => stage.drawSphere(ctx), /path creation failed/);
    assert.equal(stage.gridCache, null);
    stage.createBezierLatitudes = create;
    stage.drawSphere(ctx);
    assert.ok(stage.gridCache.paths.length);
    assert.equal(stage.sphere.dirty, false);
});
