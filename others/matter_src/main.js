/*

This example we fix the keydown handler.
*/

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Events = Matter.Events,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    Vector = Matter.Vector,
    MouseConstraint = Matter.MouseConstraint,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

engine.gravity.y = engine.gravity.x = 0;
let el = document.getElementById('playspace')
// create a renderer
let rect = el.getBoundingClientRect()
var render = Render.create({
    element: el,
    engine: engine,
    options: {
        width: rect.width,
        height: rect.height,
        showVelocity: true,
        showCollisions: true,
        showConvexHulls: true,
        showAngleIndicator: true,
    }
});


// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.009,
            render: {
                visible: false
            }
        }
    });

// Composite.add(world, mouseConstraint);

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB, ground, mouseConstraint]);


let tSize = 5
let distance = 10
let POWER = .00001
let ROTATION_POWER = .000001
                        // x, y, edges, size
var triL = Bodies.polygon(0, -distance, 3, tSize);
// Body.rotate(tri, Math.PI / 2) // rotate clockwise 1/4 of a pi, pointing UP
var triR = Bodies.polygon(0, distance, 3, tSize);
// Body.rotate(tri, Math.PI / 2)
let tris = [triL, triR]

var compoundTri = Body.create({
        parts: tris
    });

Body.translate(compoundTri, Vector.create(100, 100))
Body.rotate(compoundTri, Math.PI / 2) // rotate clockwise 1/4 of a pi, pointing UP

Composite.add(engine.world, [compoundTri]);


const powerToRight = function(e) {
    powerToEngine(e, triR)
}

const powerToLeft = function(e) {
    powerToEngine(e, triL)
}

const powerToBoth = function(e) {
    let ml = 1
    powerToEngine(e, triL, POWER*ml)
    powerToEngine(e, triR, POWER*ml)
}

const powerToEngine = function(e, engine, power=ROTATION_POWER) {
    let force = Matter.Vector.create(-power, 0)
    force = Vector.rotate(force, compoundTri.angle)
    Body.applyForce(compoundTri, engine.position, force)
    // console.log(compoundTri.position, engine.position)
}

const userButtons = {}

let fmap = {
    'ArrowLeft': powerToLeft,
    'ArrowRight': powerToRight,
    'ArrowUp': powerToBoth,
}

const updateShipForces = function(engineEvent) {
    for(let k in userButtons) {
        let isOn = userButtons[k] === true;
        if(!isOn) {
            continue
        }

        let f = fmap[k]
        if(f != undefined) {
            f(engineEvent)
        }
    }
}

Events.on(engine, "beforeUpdate", function(e){
    // console.log('compoundTri update')
    updateShipForces(e)
})


const keyDownHandler = function(e) {

    if(!userButtons[e.key] === true) {
        console.log('Setting userButtons[', e.key, ']')
    }
    userButtons[e.key] = true

    // if(e.key == 'ArrowUp') {
    //     console.log('Up')
    //     let force = Matter.Vector.create(-POWER,0)
    //     force = Vector.rotate(force, compoundTri.angle)
    //     // Body.applyForce(compoundTri, compoundTri.position, force)
    //     Body.applyForce(compoundTri, triR.position, force)
    //     Body.applyForce(compoundTri, triL.position, force)

    //     return
    // }

    if(e.key == 'ArrowDown') {
        // console.log('Down')
        let force = Matter.Vector.create(POWER,0)
        force = Vector.rotate(force, compoundTri.angle)
        Body.applyForce(compoundTri, compoundTri.position, force)
    }

    console.log(e.keyCode)
    if(e.keyCode == 32) {
        // flip grav
        if (engine.gravity.y < 0.1) {
            engine.gravity.y = .3
        } else {
            engine.gravity.y = 0
        }
    }
}


const keyUpHandler = function(e) {


    if(!userButtons[e.key] === false) {
        console.log('Unsetting userButtons[', e.key, ']')
    }
    userButtons[e.key] = false
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);


// keep the mouse in sync with rendering
render.mouse = mouse;

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);