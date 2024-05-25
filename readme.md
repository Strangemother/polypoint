# Polypoint.js

> Polypoint is a library dedicated to the humble 2D point.


## Why

I wanted a quick drawing implementation to work on my own ideas and learning.
But I didn't want to learn an entire new library to execute my thoughts; But I do know enough to read MDN.

However the draw Canvas and SVG libraries are more lower-level than I would like
whilst punching out thoughts. As such I built this; `Polypoint` - where the simple 2D point can be manipulated without the drawing framework.

Then I built some quick functions to offset the canvas drawing.


## Getting Started.

Import the lib:

```js
<script src="point_src/point.js"></script>
```

Pop a canvas into your HTML:

```jinja
<canvas id='mycanvas'></canvas>
```

Run Polypoint extras:


```js

const mypoint = new Point(100, 200)
mypoint.radius = 50

let color = 'teal'
let width = 3

class MainStage extends Stage {
    draw(ctx){
        this.clear(ctx)
        mypoint.lookAt(Point.mouse.position)
        mypoint.pen.indicator(ctx, {color, width})
    }
}

const stage = new MainStage('mycanvas')
stage.loopDraw()
```

The same, using raw canvas:

```js
const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');
/* Set the canvas (props) width and height, matching its view size. */
let rect = canvas.getBoundingClientRect()
ctx.canvas.width  = rect.width;
ctx.canvas.height = rect.height;

/* Enable the mouse monitor.*/
Point.mouse.listen(canvas)

var mypoint = new Point(100, 200)
let radius = 50
let strokeWidth = 3
let color = 'teal'


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


---

\* An accidental pun.