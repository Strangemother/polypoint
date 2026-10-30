const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function createExample() {
    const buttons = new Map();
    const canvas = {width: 800, height: 600};
    class Stage {
        static go() {
            const stage = new this();
            stage.canvas = canvas;
            stage.dragging = new context.Dragging(stage);
            stage.mounted();
            return stage;
        }
        clear() {}
    }
    const math = Object.create(Math);
    math.random = () => .5;
    const context = {
        Math: math, Stage,
        Polypoint: {head: {install() {}, mixin() {}, deferredProp() {}, lazierProp() {}}},
        addButton: (label, options) => buttons.set(label, options.onclick)
    };
    context.window = context;
    vm.createContext(context);
    for (const file of ['point_src/compass.js', 'point_src/relative-xy.js', 'point_src/point.js',
        'point_src/pointlistgenerator.js', 'point_src/pointlist.js', 'point_src/distances.js', 'point_src/dragging.js']) {
        vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
    }
    context.Dragging = vm.runInContext('Dragging', context);
    vm.runInContext(fs.readFileSync(path.join(root, 'theatre/chromites-v2.js'), 'utf8'), context, {filename: 'theatre/chromites-v2.js'});
    const api = vm.runInContext('({Point, Chromite, ChromiteWorld, stage})', context);
    return {...api, canvas, buttons, math, Dragging: context.Dragging};
}

function drawingContext() {
    const calls = [];
    const ctx = {calls};
    for (const name of ['save', 'restore', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'arc', 'fill']) {
        ctx[name] = (...args) => calls.push([name, ...args]);
    }
    return ctx;
}

test('Chromite options initialize real Point and life properties independently', () => {
    const {Point, Chromite} = createExample();
    const p = new Chromite({
        x: 25, y: 30, mass: 4, hue: 0, vx: 0, vy: -2, energy: 0,
        cool: 0, generation: 3, genes: {speed: 0, sociability: .8},
        overrideColor: 'red', customValue: 42, radians: 1
    });
    const other = new Chromite({mass: .25});
    assert.ok(p instanceof Point);
    assert.equal(p.x, 25);
    assert.equal(p.y, 30);
    assert.equal(p.radius, 8);
    assert.equal(other.radius, 2);
    assert.equal(p.energy, 0);
    assert.equal(p.hue, 0);
    assert.equal(p.vx, 0);
    assert.equal(p.vy, -2);
    assert.equal(p.genes.speed, 0);
    assert.equal(p.genes.sociability, .8);
    assert.ok(Number.isFinite(p.genes.longevity));
    assert.equal(p.customValue, 42);
    assert.equal(p.generation, 3);
    assert.ok(Math.abs(p.radians - 1) < 1e-12);
    assert.notEqual(p.genes, other.genes);
    assert.notEqual(p.uuid, other.uuid);
    assert.equal(new Chromite({mass: 4, radius: 3}).radius, 3);
});

test('render draws the body and tail using instance properties', () => {
    const {Chromite} = createExample();
    const p = new Chromite({x: 100, y: 80, radius: 6, overrideColor: 'red'});
    const ctx = drawingContext();
    p.render(ctx);
    assert.equal(p.tail.length, 7);
    assert.equal(ctx.calls.filter(call => call[0] === 'stroke').length, 7);
    const arc = ctx.calls.find(call => call[0] === 'arc');
    assert.deepEqual(arc.slice(1, 4), [100, 80, 3.96]);
    assert.equal(ctx.fillStyle, 'red');
    assert.equal(ctx.strokeStyle, 'red');
});

test('gene inheritance uses weighted parents and the configured mutation bounds', () => {
    const {Chromite, math} = createExample();
    const names = Object.keys(Chromite.geneRules);
    const parent = Object.fromEntries(names.map(name => [name, 1]));
    const other = Object.fromEntries(names.map(name => [name, 0]));

    let rolls = [0.8, 0.5, 0.5];
    math.random = () => rolls.shift() ?? 0.5;
    class OneGene extends Chromite {
        static geneRules = {aggression: {min: 0, max: 1, variation: .25}};
    }
    assert.equal(OneGene.inheritGenes(parent, other, .25).aggression, .25);

    rolls = [0.3, 0, 0];
    assert.equal(OneGene.inheritGenes(parent, other, .25).aggression, 0);
    rolls = [0.1, 0.8];
    assert.equal(OneGene.inheritGenes(parent).aggression, .8);

    math.random = () => .1;
    const inherited = Chromite.inheritGenes(parent);
    for (const name of names) {
        const {min, max} = Chromite.geneRules[name];
        assert.ok(Math.abs(inherited[name] - (min + .1 * (max - min))) < 1e-12);
    }
});

test('stage seeds a draggable population, renders it and exposes controls', () => {
    const {stage, Chromite, buttons} = createExample();
    assert.equal(stage.world.points.length, 20);
    assert.ok(stage.world.points.every(p => p instanceof Chromite));
    assert.equal(stage.dragging.points.size, 20);
    assert.equal(stage.world.nutrients.length, 80);
    const ctx = drawingContext();
    stage.draw(ctx);
    assert.ok(ctx.calls.some(call => call[0] === 'fill'));
    const foodCount = stage.world.nutrients.length;
    buttons.get('Sprinkle food')();
    assert.equal(stage.world.nutrients.length, foodCount + 14);
    const count = stage.world.points.length;
    buttons.get('Add Chromies (3–6)')();
    assert.equal(stage.world.points.length, count);
    stage.world.maxPopulation += 5;
    buttons.get('Add Chromies (3–6)')();
    assert.equal(stage.world.points.length, count + 5);
    assert.equal(stage.dragging.points.size, stage.world.points.length);
    stage.onLongClick({offsetX: 100, offsetY: 120});
    assert.equal(stage.world.nutrients.length, foodCount + 28);
});

test('food consumption changes mass, energy, hue and digestion', () => {
    const {Chromite, ChromiteWorld, canvas} = createExample();
    class StillChromite extends Chromite { step() {} }
    const world = new ChromiteWorld({canvas});
    const p = new StillChromite({x: 100, y: 100, mass: 1, hue: 0, energy: 20});
    world.add(p);
    world.makeFood(100, 100, .25, 30);
    world.driftFood = () => {};
    world.step();
    assert.equal(world.nutrients.length, 0);
    assert.equal(p.mass, 1.25);
    assert.equal(p.energy, 31.25);
    assert.ok(p.hue > 0 && p.hue < 30);
    assert.ok(p.digestTimer > 0);
});

test('merges conserve mass and unregister removed creatures', () => {
    const {Chromite, ChromiteWorld, canvas, Dragging} = createExample();
    class StillChromite extends Chromite { step() {} }
    const dragging = new Dragging();
    const world = new ChromiteWorld({canvas, dragging});
    const a = new StillChromite({x: 100, y: 100, mass: 2, hue: 10, speedScale: .4});
    const b = new StillChromite({x: 101, y: 100, mass: 1, hue: 15});
    const c = new StillChromite({x: 400, y: 100, hue: 150});
    const d = new StillChromite({x: 600, y: 100, hue: 240});
    world.add(a, b, c, d);
    world.step();
    assert.equal(world.points.length, 3);
    assert.equal(a.mass, 3);
    assert.equal(a.speedScale, .4);
    assert.equal(world.points.includes(b), false);
    assert.equal(dragging.points.has(b.uuid), false);
    assert.equal(dragging.points.size, 3);
});

test('individual merge thresholds control collisions from both creatures', () => {
    const {Chromite, ChromiteWorld, canvas} = createExample();
    class StillChromite extends Chromite { step() {} }
    const world = new ChromiteWorld({canvas});
    const a = new StillChromite({x: 100, y: 100, hue: 10, mergeHueDiff: 40});
    const b = new StillChromite({x: 101, y: 100, hue: 20, mergeHueDiff: 5});
    world.add(a, b, new StillChromite({x: 400, y: 100}), new StillChromite({x: 600, y: 100}));
    assert.throws(() => world.add(a), /already in this world/);
    assert.throws(() => world.add(new Chromite({uuid: a.uuid})), /Duplicate chromite uuid/);
    world.step();
    assert.equal(world.points.length, 4);
    assert.equal(a.cool, 22);
    assert.equal(b.cool, 22);
});

test('burst creates subclass offspring, advances generation and conserves mass under the population cap', () => {
    const {Chromite, ChromiteWorld, canvas, Dragging} = createExample();
    class CustomChromite extends Chromite {
        step() {}
        createOffspring(options) {
            return super.createOffspring({...options, customValue: this.customValue});
        }
    }
    const dragging = new Dragging();
    const world = new ChromiteWorld({canvas, dragging, maxPopulation: 4});
    const parent = new CustomChromite({
        x: 400, y: 300, mass: 3, hunger: 10, energy: 100, generation: 2,
        mateHueMix: 50, burstHunger: 10, speedScale: .4, customValue: 'inherited'
    });
    world.add(parent);
    world.step();
    assert.equal(world.points.length, 4);
    assert.ok(world.points.every(p => p instanceof CustomChromite && p.generation === 3));
    assert.ok(world.points.every(p => p.mateHueMix === 50 && p.burstHunger === 10 &&
        p.speedScale === .4 && p.customValue === 'inherited'));
    assert.ok(Math.abs(world.points.reduce((sum, p) => sum + p.mass, 0) - 3) < 1e-12);
    assert.equal(dragging.points.size, 4);
    assert.equal(dragging.points.has(parent.uuid), false);
    assert.equal(world.shockwaves.length, 1);
    assert.throws(() => world.add(new Chromite()), /population limit/);
});

test('deaths recycle mass and germination and arrivals use the configured subclass', () => {
    const {Chromite, ChromiteWorld, canvas, Dragging} = createExample();
    class CustomChromite extends Chromite { step() {} }
    const dragging = new Dragging();
    const world = new ChromiteWorld({canvas, dragging, ChromiteClass: CustomChromite});
    const dying = new CustomChromite({x: 300, y: 200, mass: 1.5, energy: 0, age: 901});
    world.add(dying);
    world.step();
    assert.equal(dragging.points.has(dying.uuid), false);
    assert.equal(world.points.length, 1);
    assert.ok(world.points[0] instanceof CustomChromite);
    const total = world.points[0].mass + world.nutrients.reduce((sum, f) => sum + f.mass, 0);
    assert.ok(Math.abs(total - 1.5) < 1e-12);
    world.addChromies();
    assert.ok(world.points.every(p => p instanceof CustomChromite));
    assert.equal(dragging.points.size, world.points.length);
});

test('instance neighbour limits can disable cohesion without invalid coordinates', () => {
    const {Chromite, ChromiteWorld, canvas} = createExample();
    const world = new ChromiteWorld({canvas});
    const p = new Chromite({x: 100, y: 100, maxNeighbourTrack: 0, genes: {sociability: 1}});
    world.add(p, new Chromite({x: 110, y: 110, genes: {sociability: 1}}));
    world.step();
    assert.ok(Number.isFinite(p.x));
    assert.ok(Number.isFinite(p.y));
});

test('world uses subclass step and render hooks across many frames', () => {
    const {Chromite, ChromiteWorld, canvas, Dragging} = createExample();
    class CustomChromite extends Chromite {
        step(world) { this.steps = (this.steps || 0) + 1; super.step(world); }
        render(ctx) { this.renders = (this.renders || 0) + 1; super.render(ctx); }
    }
    const dragging = new Dragging();
    const world = new ChromiteWorld({canvas, dragging, ChromiteClass: CustomChromite, maxPopulation: 12});
    world.seed();
    const ctx = drawingContext();
    for (let i = 0; i < 100; i++) {
        world.step();
        world.render(ctx);
        assert.ok(world.points.length <= 12);
        assert.equal(dragging.points.size, world.points.length);
        assert.ok(world.points.every(p => p instanceof CustomChromite &&
            Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.energy) &&
            Number.isFinite(p.mass) && p.mass > 0));
    }
    assert.ok(world.points.some(p => p.steps > 0 && p.renders > 0));
});

test('subclasses can customize individual movement and rendering phases', () => {
    const {Chromite, ChromiteWorld, canvas} = createExample();
    class CustomChromite extends Chromite {
        seekFood(world, desperate, desperation) {
            this.foodPhaseCalled = true;
            super.seekFood(world, desperate, desperation);
        }
        move(world, desperation) {
            this.movePhaseCalled = true;
            super.move(world, desperation);
        }
        renderBody(ctx) {
            this.bodyPhaseCalled = true;
            super.renderBody(ctx);
        }
    }
    const world = new ChromiteWorld({canvas});
    const chromite = new CustomChromite({x: 100, y: 100});
    world.add(chromite);
    world.step();
    world.render(drawingContext());
    assert.ok(chromite.foodPhaseCalled);
    assert.ok(chromite.movePhaseCalled);
    assert.ok(chromite.bodyPhaseCalled);
    assert.ok(Number.isFinite(chromite.x));
});
