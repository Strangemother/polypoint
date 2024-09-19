let creature = new Point(400, 400);
creature.health = .5

let learningRate = .3;
var performLearning = false;
var loadNeuronsFromFile = true;
var autoStore = false;


var brainTick = undefined;

var previousDistance = undefined;
var distanceToTarget = undefined;
var forwardOutput = undefined;
var rotationOutput = undefined;
var reverseOutput = 1


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    resultText = 'result text'
    mounted(){
        const point = this.center.copy()
        point.radius = 10
        this.point = creature
        this.target = new Point(450, 200)
        creature.lookAt(this.target);

        let l = new Label(this.ctx, {
            text: this.resultText
            , fontSize: 16
            , fontName: 'barlow'
        });

        l.position = new Point(100, 100)
        this.label = l

         let il = new Label(this.ctx, {
            text: 'inputs'
            , fontSize: 16
            , fontName: 'barlow'
        });

        il.position = new Point(100, 120)
        this.inputLabel = il

        let ol = new Label(this.ctx, {
            text: 'output'
            , fontSize: 16
            , fontName: 'barlow'
        });

        ol.position = new Point(100, 140)
        this.outputLabel = ol

        start();
        this.events.wake()
    }

    onClick(ev) {
        this.point.set(ev.offsetX,ev.offsetY)
        this.point.lookAt(this.target)
    }

    draw(ctx){
        this.clear(ctx)
        this.target.pen.fill(ctx, '#880000')
        const p = this.point

        if(p.x > 800) {
            p.x = 10
        }else if(p.x < 9) {
            p.x = 790
        }

        if(p.y > 600) {
            p.y = 10
        }else if(p.y < 9) {
            p.y = 590
        }

        // this.label.text = this.resultText
        this.label.writeText(ctx,  '#DDD')
        this.inputLabel.writeText(ctx,  '#DDD')
        this.outputLabel.writeText(ctx,  '#DDD')

        p.pen.indicator(ctx, {color:'green'})
    }
}


const creatureTick = function() {
    let items = getBrainResult()
    let [forward, reverse, relRotation] = items

    let extra = ((random.float() - .5) * 8)
    if(random.float() < .49) {
        extra *= -1
    }
    creature.rotation += ((relRotation - .5 ) * 10 ) + extra
    creature.relative.move(new Point({x: forward, y: 0}), forward - reverse)
    // creature.relative.left(forward - reverse)

    const target = stage.target
    const distance = creature.distanceTo(target)

    if(distance < target.radius + creature.radius) {
        stage.target = random.point(500)
        creature.health = 1
    }

    // if(distance > 200) {

    //     creature.update({
    //         rotation: random.int(360),
    //         x: random.int(600),
    //         y: random.int(500),
    //     })
    // }

    let needle = getRotationCorrection(creature, target);
    if(needle > .8 && performLearning == true) {
        console.log('training')
        let reward = [forward, random.float(), needle]
        stage.label.text = reward.map((v) => v.toFixed(3)).join(' ')
        brain.propagate(learningRate, items)

        if(autoStore == true) {
            localStorage['creature'] = JSON.stringify(brain.toJSON())
            if(storeClock != undefined) {
                clearInterval(storeClock)
            }
            storeClock = setTimeout(function(){
                console.log('Saving')
            }, 1000)
        }
    }

}


function getAngleToTarget(creature, target) {
    const deltaX = target.x - creature.x;
    const deltaY = target.y - creature.y;
    return Math.atan2(deltaY, deltaX); // Angle to the target
}


function getRotationCorrection(creature, target) {

    /* Here we compute 180 <> -180 degrees relative to the direction of the
    target and invert the value. E.g looking directly at the target, the focus is 0

        1. calculate relative _0_,
        2. -180, to make _looking at_ a positive value
        3. /180, to make a float between 0 <> 1.

    The result is a `1` as we're looking at the target, `0` when looking directly away
    */
    focusValue =  (Math.abs(calculateAngle180(creature, stage.target))) / 180
    return 1- focusValue

    // const targetAngle = getAngleToTarget(creature, target);
    // const angleDifference = targetAngle - creature.rotation;
    // // Normalize angle difference between -Ï€ and Ï€
    // return Math.atan2(Math.sin(angleDifference), Math.cos(angleDifference));
}


const getBrainResult = function() {

    const p = creature;
    const t = stage.target;
    const dim = stage.dimensions
    const maxRad = 5;
    const rads = (1+(p.rotation  / 360)) * .5
    const rot = getRotationCorrection(p, t)//.toFixed(3)
    let inputs = [
            p.x / dim.width,
            p.y / dim.height,
            t.x / dim.width,
            t.y / dim.height,
            rads,
            rot,
            // p.health *= .999,
        ]

    let items  = brain.activate(inputs);
    let [forward, reverse, rotation] = items;

    stage.inputLabel.text = "In:   " + inputs.map((v) => v.toFixed(3)).join(' ')
    stage.outputLabel.text = "Out: " + items.map((v) => v.toFixed(3)).join(' ')
    stage.label.text = rot

    let result = [
        forward,
        reverse,
        rotation,
    ]
    // 2 neuron result.
    return result
}

const makeExpected = function(ok=false) {
    const target = stage.target
    distanceToTarget = creature.distanceTo(target)

    if(previousDistance) {
        rotationOutput = 0

        rotationOutput = getRotationCorrection(creature, target); // Rotate to face target
        forwardOutput = 1 - rotationOutput
        ok = true
    }

    previousDistance = distanceToTarget

    // console.log(forwardOutput, rotationOutput)
    if(!ok) { return makeExpected(true) }
    return [forwardOutput, reverseOutput, rotationOutput]
}


const start = function(tick=10) {
    brainTick = setInterval(creatureTick, tick)
    return brainTick;
}

const stop = function() {
    clearInterval(brainTick)
}


var input = 6;
var pool = 20;
var output = 3; // forward, reverse, rotations amount
var connections = 30;
var gates = 20;

var storeClock = undefined;

const buildBrain = function(){
    const Type = synaptic.Architect.Liquid

    if(autoStore == true) {
        const data = localStorage['creature']
        if(data != undefined) {
            window.NEURONS = JSON.parse(data)
        }
    }

    if(window.NEURONS && (loadNeuronsFromFile == true)) {
        console.log('load neurons')
        return Type.fromJSON(NEURONS)
    }
    let r = new Type(input, pool, output, connections, gates);
    return r
}

const brain = buildBrain()
const trainer = new synaptic.Trainer(brain)


const train = function(){

    var trainer = new synaptic.Trainer(brain)
    let [px, py] = [-1,-1]
    let [tx, ty] = [-1,-1]
    var trainingSet = [
      {
        input: [px,py,tx,ty,random.float(), 1],
        output: [.99, 0, 0.5]
      },
      {
        input: [px,py,tx,ty, .5, 0.02],
        output: [0, .99, .5]
      },
      {
        input: [tx,ty, px-10,py-10, random.float(), 0.02],
        output: [0, .02, 1]
      },
      {
        input: [tx,ty, px-(random.float() * 100),py-(random.float() * 100), random.float(), .999],
        output: [0, 1, 0]
      },
      //,
      // {
      //   input: [px,py,tx,ty,0],
      //   output: [1, .2, .5]
      // },
      // {
      //   input: [px,py,tx,ty,0],
      //   output: [.4, 0, .2]
      // },
    ]

    // trainer.trainAsync(trainingSet).then(results => console.log('done!', results))
    trainer.train(trainingSet,/*{
        rate: .1,
        iterations: 20000,
        error: .005,
        shuffle: true,
        log: 1000,
        cost: Trainer.cost.CROSS_ENTROPY
    }*/);
    return trainer;
}


stage = MainStage.go()
