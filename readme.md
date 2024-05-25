# Polypoint.js

> Polypoint is a library dedicated to the humble 2D point.

Polypoint aims to provide a straightforward interface for working with 2D points, enabling users to engage in mathematical and creative point drawing without the complexity of traditional drawing libraries. It supports low-level context drawing, allowing users to implement their own drawing logic with ease.


```js
let point = new Point(200, 300)
let newPoint = point
                .add(new Point(100, 100)) // Translate
                .rotate(33)               // Rotate (degrees)
                .project(100)             // project forward
                .lookAt(point)            // Rotate
                ;

// Canvas draw
newPoint.pen.ngon(ctx, 6, 50)         // Hexagon with a radius

// DOM appliance
let divStyles = getElementById('mypoint').styles
divStyles.top = `${newPoint.x}px`
divStyles.left = `${newPoint.y}px`
```


To help focus on the humble point `Polypoint` offers quick canvas drawing tools, offsetting the setup and execution of the boring parts. Consider this the _framework-less_ drawing tools, and the `Point`.

A quick example of running a _raw_ canvas:

```js

const draw = function(ctx){
    /* A freebie */
    stage.clear(ctx)

    /* Raw canvas drawing. */
    radius = 10
    ctx.moveTo(100, 100)
    ctx.arc(ctx, radius)
    ctx.stroke()

    /* Polypoint point! */
    let p = point(100, 100)
    p.pen.circle(radius)
}

/* Prepare and run! */
const stage = new Stage('#mycanvas', drawFunc)

stage.draw() // Draw once.
stage.drawLoop() // AnimationFrame draw loop
```

## Quick Started.

Import the lib:

```js
<script src="point_src/point.js"></script>
```

Pop a canvas into your HTML:

```jinja
<canvas id='mycanvas'></canvas>
```

Use `Polypoint.Stage` to help render a canvas `Point`. A "Stage" provides quick access to the canvas Context('2D'). Override "draw", or provide a draw function through the Stage constructor:


```js
/* Using a stage */
let mypoint = new Point(100, 200)
    , color = 'teal'
    , width = 3
    ;

mypoint.radius = 50

class MainStage extends Stage {
    /* No hoops to jump - canvas context as expected. */
    draw(ctx){
        this.clear(ctx)                            // run clearRect(...) call.
        mypoint.lookAt(Point.mouse.position)       // Rotate to look at the mouse
        mypoint.pen.indicator(ctx, {color, width}) // optional drawing tools.
    }
}

/* Or: new MainStage('mycanvas', myDrawFunc) */
const stage = new MainStage('mycanvas')
/* And Go! */
stage.loopDraw()
```

---

PFFT Hate easy to use `Stage` setups? No problem! Here's a vanilla canvas setup,
using the `Point` in our own context:

```js
/* Using vanilla canvas and a point. */
const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');

/* Set the canvas (props) width and height, matching its view size. */
let rect = canvas.getBoundingClientRect()
ctx.canvas.width  = rect.width;
ctx.canvas.height = rect.height;

/* Enable the mouse monitor.*/
Point.mouse.listen(canvas)

let mypoint = new Point(100, 200)
    , radius = 50
    , strokeWidth = 3
    , color = 'teal'
    ;

function draw() {
    /* A standard canvas draw function to update our point
    per frame. */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /* Rotate the point to look at the mouse, then draw a circle (an arc)
    using the pen tool. */
    mypoint.lookAt(Point.mouse.position)
    /* Pop a circle a the point.*/
    mypoint.pen.circle(ctx, radius, color, strokeWidth)
    /* Draw a line from the project point, back to the origin */
    let projectedPoint = mypoint.project()
    projectedPoint.pen.line(ctx, mypoint, radius, color, strokeWidth)

    /* Rinse - repeat ... */
    requestAnimationFrame(draw);
}

/* Start the loop...*/
draw()
```


## What's in the Box

1. `Point`
2. `PointList`
3. .

Doesn't sound like much; That's the Point\*!

## Philosophy

Polypoint is designed to help users translate mathematical concepts into visual representations effortlessly. The idea is simple: if you can describe a direction or a point in your mind, you can express it using Polypoint.

## Why

I wanted a quick drawing implementation to work on my own ideas and learning.
But I didn't want to learn an entire new library to execute my thoughts; But I do know enough to read MDN.

However the draw Canvas and SVG libraries are more lower-level than I would like
whilst punching out thoughts. As such I built this; `Polypoint` - where the simple 2D point can be manipulated without the drawing framework.

Then I built some quick functions to offset the canvas drawing.


---

\* An accidental pun.


