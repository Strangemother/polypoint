/*
title: Brownian Walker
categories: brownian
    random
files:
    ../theatre/brain.js
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/functions/range.js
    ../point_src/relative.js
    ../point_src/constrain-distance.js
    ../point_src/screenwrap.js
---

A tiny walker to move towards a browian point.
*/


// const trainingData = [
//      [0.93,0.93,.34,.34,0.33,0.63,.53,.53,.01],
//      [0.93,.34,0.63,0.63,.53,.01],
//      [.01,.01,.01],
//      [.34,.34,0.93,0.93,0.63,0.63,.53,.53,.34,.77]
// ];

// const lstm = new brain.recurrent.LSTM();
// const result = lstm.train(trainingData, {
//   iterations: 15,
//   log: details => console.log(details),
//   errorThresh: 0.011
// });

// const run1 = lstm.run(0.01);
// const run2 = lstm.run(.9);
// const run3 = lstm.run(.53);
// const run4 = lstm.run(.7);

// console.log('run 1:', run1);
// console.log('run 2:', run2);
// console.log('run 3:', run3);
// console.log('run 4:', run4);


let fleeSettings = {
    tailLength: 3,
    turnSpeed: .18,
    maxTouchDistance: 6,
    viewSpaceOffset: 10,
    viewSpaceMultiplerSize: 3,
    forwardSpeed: 1.7,
    leashDistanceMultiplier: 2,
    radius: 1.2,
    color: 'green',
}


const sliderValue = function(value, min, max, step) {
    let d = {}
    if(step != undefined) { d.step = step }
    if(value != undefined) { d.value = value }
    if(min != undefined) { d.min = min }
    if(max != undefined) { d.max = max }
    return d;
}

const sliders = {
    tailLength:              sliderValue(   3,   2, 40)
    , turnSpeed:               sliderValue( .18,  .1,  1,  .05)
    , maxTouchDistance:        sliderValue(   6,   6, 20)
    , viewSpaceOffset:         sliderValue(  10,  10, 30)
    , viewSpaceMultiplerSize:  sliderValue(   3,   2, 20)
    , forwardSpeed:            sliderValue( 1.7,  .1,  3,  .10)
    , leashDistanceMultiplier: sliderValue(   2, 1.5, 20,   .2)
    , radius:                  { step: .10, value: 1.2, min: 1, max: 20 }
};

addSliderControlSet(sliders);

addButton('Generate', {
    onclick: ()=> {
        let d = {}
        for(let k in sliders) {
            d[k] = parseFloat(appShared.miniApp.controls[k].value)
        };

        stage.newWalker(Object.assign(d, { x: 300, y: 300}))
    }
})


class Walker extends Point {

    init(d) {
        this.updateSpeed = 20
        this.lookSpeedUpdateSpeed = 10
        this.touchSpaceUpdateSpeed = 10
        this.forwardSpeed = 1
        this.turnSpeed = .2
        this.maxTouchDistance = 10
        this.viewSpaceOffset = -20
        this.viewSpaceMultiplerSize = 10
        this.modu = d.modu ==undefined? 0: d.modu
        this.leashDistanceMultiplier = 1
        this.tailLength = 10

        this.viewPoint = new Point(this.copy())
        this.update(d)
        this.updateLookSpace()
    }

    step(delta=1){
        this.modu += 1
        if(this.modu % this.updateSpeed == 0) {
            // this.updateWalker()
        }
        if(this.modu % this.lookSpeedUpdateSpeed == 0) {
            // this.updateLookSpace()
        }
        if(this.modu % this.touchSpaceUpdateSpeed == 0) {
            // this.updateTouchSpace()
        }

        // this.turnTo(this.viewPoint, this.turnSpeed * delta)
        // this._relativeMove(this, new Point({x:1, y:0}), 1, )
        // this.relative.forward(this.forwardSpeed * delta)
    }

    updateTouchSpace(){
        if(this.distanceTo(this.viewPoint) < this.maxTouchDistance) {
            this.updateWalker()
        }
    }

    updateWalker(max=.5) {
        this.updateLookSpace()
        this.viewPoint.xy = random.within(this.viewSpace, max)
    }

    updateLookSpace() {
        let eyeballSpace = this.viewSpaceOffset
        let viewSpaceSize = this.viewSpaceMultiplerSize
        let r = this.radius * viewSpaceSize
        this.viewSpace = this.project(
                r
                + this.radius
                + eyeballSpace
            ).update({radius: r})
    }
}


const DummyBrain = {
  run(inputs){ // inputs = array of [-1,1]
    const [bearing, dist, touch] = inputs;
    const turn     = 0.9 * bearing;
    const throttle = 0.6 * (1 - (dist+1)/2); // farther→faster
    return [turn, throttle]; // both in [-1,1]
  }
};


class TailWalker extends Walker {

    init(d) {
        super.init(d)
        this.points = PointList.generate.countOf(this.tailLength)
        this.points.each.radius = 2
        this.points.each.xy = this.xy
        this.points.unshift(this)

        this.sensors = [ new BearingToFood(), new DistToFood(100), new TouchFood() ];
        this.sensors.forEach(s => s.init(this));
        this.brain = DummyBrain
    }

    step(delta=1){
        super.step(delta)
        this.updateLeash()
        this.updateBrain()
    }

    updateLeash(){
        let h = this
        let leashLength = h.radius * h.leashDistanceMultiplier
        h.points.siblings().forEach((pair)=>{
            // pair[1].track(pair[0], leashLength)
            pair[1].leash(pair[0], leashLength)
        })
    }

    updateBrain(){
        const x = this.getInputs();
        const y = this.brain.run(x);
        this.sensorString = x.map((z)=>z.toFixed(2).padStart(6)).join(', ')
        this.applyOutputs(y);

    }

    getInputs(){
        return this.sensors.map(s => s.read() + sim.noise(.1))
    }  // e.g. [b,d,t]

    applyOutputs([turn, throttle]){
      const clamp = (x,m=1)=>Math.max(-m,Math.min(m,x));
      let r = clamp(turn) * this.turnSpeed;
      this.radians += r
      // this.turnTo(this.viewPoint, r)

      const speed = this.forwardSpeed * (0.5 + 0.5 * clamp(throttle));
      this.relative.forward(speed);
    }

}

// returns a value in [-1, 1]
class Sensor {
  init(host){ this.h = host }     // keep a ref to snotite
  read(){ return 0 }              // override
}


const sim = {
    food: new Point(300,300, 20)
    , noise: (v=.1)=> random.float(-1, 1) * v
}


class BearingToFood extends Sensor {
    read(){
        const f = sim.food; if(!f) return 0;
        const a = Math.atan2(f.y - this.h.y, f.x - this.h.x) - this.h.radians;
        let b = (a + Math.PI) % (2*Math.PI); b = b < 0 ? b + 2*Math.PI : b; b -= Math.PI;
        return b / Math.PI; // [-1,1]
    }
}


class DistToFood extends Sensor {
    constructor(R=100){ super(); this.R = R }
    read(){
        const f = sim.food; if(!f) return 0;
        const d = Math.hypot(f.x - this.h.x, f.y - this.h.y);
        return Math.max(-1, Math.min(1, (d/this.R)*2 - 1)); // far→+1, near→-1
    }
}


class TouchFood extends Sensor {
    read(){
        const f = sim.food; if(!f) return -1;
        return this.h.distanceTo(f) <= (this.h.radius + 10 + f.radius) ? 1 : -1;
    }
}


sim.samples = []; // {input:[bearing,dist,touch], output:[turn,throttle]}

function tickWithRecorder(walker){
  const x = walker.getInputs();        // already in [-1,1]
  const y = DummyBrain.run(x);          // your current rule
  sim.samples.push({ input: x, output: y });
  walker.applyOutputs(y);
}

const newNet = function(){
    const net = new brain.NeuralNetwork({
        inputSize:  3,            // bearing, dist, touch
        hiddenLayers: [5,4],        // tiny
        outputSize: 2             // turn, throttle
    });
    return net;
}

const trainNet = function(net, samples=sim.samples, iterations=2000) {
    net.train(samples, {
      iterations: iterations,
      learningRate: 0.01,
      errorThresh: 0.005,
      log: false
    });
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        // this.screenWrap = new ScreenWrap()
        this.screenWrap.setDimensions({top: -50, left: -50, bottom: 900, right: 900})
        this.delta = 1
        this.doClear = true
        let s = this
        addButton('add', {
            onclick(){
                s.newWalker(Object.assign({ x: 300, y: 300}))
            }
        })

        addButton('add flee', {
            onclick(){
                s.newWalker(Object.assign(fleeSettings, { x: 300, y: 300}))
            }
        })

        addButton('clear', {
            onclick(){
                s.walkers = new PointList()
            }
        })

        this.walkers = new PointList()

        this.expertWalker = this.newWalker({
                leashDistanceMultiplier: 1
                , tailLength: 30
                , forwardSpeed: 1.3
                , turnSpeed: .8
                , radius: 1.3
            })

        this.childWalker = this.newWalker({
                leashDistanceMultiplier: 1
                , tailLength: 25
                , forwardSpeed: 1
                , turnSpeed: .8
                , radius: 1
            })
        // this.childWalker.brain = newNet()
        this.walkers.push(this.expertWalker, this.childWalker)

        this.dragging.add(sim.food)
    }

    freezeMode(){
        this.delta = .1
        this.doClear = false
    }

    newWalker(extra) {
        let w = this.generateWalker(this.genD(), extra)
        this.walkers.push(w)
        return w
    }

    onMousedown(ev){
        tickWithRecorder(this.walkers[0])
        sim.food.xy = Point.from(ev).xy
    }

    genD(){
        let ri = random.int.bind(random);
        let rf = random.float.bind(random);

        let d = {
            lookSpeedUpdateSpeed: 10
            , touchSpaceUpdateSpeed: 10
            , updateSpeed: 50
            , forwardSpeed: rf(.1, 2)
            , turnSpeed: rf(.1, .3)
            , maxTouchDistance: ri(6, 20)
            , viewSpaceOffset: ri(10, 30)
            , viewSpaceMultiplerSize: ri(2,10)
            , leashDistanceMultiplier: ri(1.5,7)
            , tailLength: ri(2,5)
        }
        return d

    }

    generateWalker(d, d2) {
        d = Object.assign({}, d)
        let p = new TailWalker({
                        x:random.int(500)
                        , y:random.int(500)
                        , radius: random.float(.5, 3)
                        , rotation: random.int(160)
                        , color: random.color()
                        , modu: i
                    })

        p.init(Object.assign(d, d2));
        return p
    }

    draw(ctx) {
        this.doClear && this.clear(ctx)
        this.walkers.forEach(p=>{
            this.step(p, this.delta)
            this.drawPoint(ctx, p)
        })

        sim.food.pen.fill(ctx, 'green', 3)
    }

    drawPoint(ctx, h){
        ctx.lineWidth = 1

        // h.viewSpace.pen.circle(ctx, {color: '#222255'})
        // h.viewPoint.pen.fill(ctx, 'red', 1)

        ctx.lineWidth = h.radius
        h.points?.pen.quadCurve(ctx, h.color, false)
        // h.points?.pen.fill(ctx, '#aaa', 1)

        h.pen.fill(ctx, h.color)

        let sws = h.screenWrapSector
        if(sws?.dirty) {
            h.screenWrapSector_cache = `${sws.x}, ${sws.y}`
        }

        // h.text.offsetString(ctx, h.screenWrapSector_cache, {x:-10, y:-10})
        // h.text.string(ctx, h.sensorString)
    }

    step(p, delta=1){
        let didChange = this.screenWrap.perform(p)
        p.step(delta)
        if(didChange) {
            p.updateWalker(.5)
        }
    }
}



stage = MainStage.go(/*{ loop: true }*/)
