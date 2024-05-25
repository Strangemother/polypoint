/* Double Engine.

This example provides two engines coupled together using a constraint.
Power to an arrow applies an impulse to the _opposite side_ engine.

The space bar toggles gravity.
*/

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
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
// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
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
            stiffness: 0.007,
            render: {
                visible: false
            }
        }
    });

// Composite.add(world, mouseConstraint);

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB, ground, mouseConstraint]);


                        // x, y, edges, size
var triL = Bodies.polygon(0, 0, 3, 10);
// Body.rotate(tri, Math.PI / 2) // rotate clockwise 1/4 of a pi, pointing UP
var triR = Bodies.polygon(0, 40, 3, 10);
// Body.rotate(tri, Math.PI / 2)
let tris = [triL, triR]

var compoundTri = Body.create({
        parts: tris
    });

Body.translate(compoundTri, Vector.create(100, 100))
Body.rotate(compoundTri, Math.PI / 2) // rotate clockwise 1/4 of a pi, pointing UP

Composite.add(engine.world, [compoundTri]);

let POWER = .0001

document.addEventListener('keydown', (e)=>{

    if(e.key == 'ArrowUp') {
        // console.log('Up')
        let force = Matter.Vector.create(-POWER,0)
        force = Vector.rotate(force, compoundTri.angle)
        // Body.applyForce(compoundTri, compoundTri.position, force)
        Body.applyForce(compoundTri, triR.position, force)
        Body.applyForce(compoundTri, triL.position, force)
    }

    if(e.key == 'ArrowDown') {
        // console.log('Down')
        let force = Matter.Vector.create(POWER,0)
        force = Vector.rotate(force, compoundTri.angle)
        Body.applyForce(compoundTri, compoundTri.position, force)
    }

    if(e.key == 'ArrowLeft') {
        // Apply force to the base of the tri.
        // console.log('Left')
        // compoundTri.angle -= .01
        let force = Matter.Vector.create(POWER,0)
        force = Vector.rotate(force, compoundTri.angle)
        Body.applyForce(compoundTri, triR.position, force)
        console.log(compoundTri.position,triR.position)
    }

    if(e.key == 'ArrowRight') {
        // console.log('Right')
        // compoundTri.angle += .01
        let force = Matter.Vector.create(POWER,0)
        force = Vector.rotate(force, compoundTri.angle)
        // console.log('Right', triR.angle)
        Body.applyForce(compoundTri, triL.position, force)
        // Body.applyForce(tri, tri.position, Matter.Vector.create(-.0001,0))
        console.log(compoundTri.position,triL.position)
    }

    console.log(e.keyCode)
    if(e.keyCode == 32) {
        // flip grav
        if (engine.gravity.y < 0.1) {
            engine.gravity.y = .1
        } else {
            engine.gravity.y = 0
        }
    }
})

// keep the mouse in sync with rendering
render.mouse = mouse;

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);