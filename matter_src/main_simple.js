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

var tri = Bodies.polygon(450, 150, 3, 10);
Composite.add(engine.world, [tri]);

document.addEventListener('keydown', (e)=>{
    if(e.key == 'ArrowUp') {
        console.log('Up')
        let force = Matter.Vector.create(-.0001,0)
        force = Vector.rotate(force, tri.angle)
        Body.applyForce(tri, tri.position, force)
    }
    if(e.key == 'ArrowDown') {
        console.log('Down')
        let force = Matter.Vector.create(.0001,0)
        force = Vector.rotate(force, tri.angle)
        Body.applyForce(tri, tri.position, force)
    }
    if(e.key == 'ArrowLeft') {
        console.log('Left')
        tri.angle -= .01
        // Body.applyForce(tri, tri.position, Matter.Vector.create(-.0001,0))
    }
    if(e.key == 'ArrowRight') {
        console.log('Right')
        tri.angle += .01
        // Body.applyForce(tri, tri.position, Matter.Vector.create(-.0001,0))
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