Ideas:

Pull a point onto another point, connecting the pair with a curve line

---

speedy point: A point wih speed lines and a parallaxing star field in the
background

---

Paper ship: A polypoint with a paper space ship on a string.
Emit points from the engine when dragging the string pin

---

Can draw a goldern ratio

---

The header example for a component can use the component:

+ gearbox: Each letter in the title is a geared item
+ strings: Each letter is on a string.
+ Constaints: each letter is a constaint object.
+ easing: Each letter eases with a unique function

---

cheaper keyprop using Table

---

add file meta keyword to importables for graph dependencies.

---

flatten imports into meta data automatically somhow.

https://www.youtube.com/watch?v=p4YirERTVF0
https://www.youtube.com/watch?v=makaJpLvbow
https://www.youtube.com/watch?v=scvuli-zcRc&t=0s

---

http://arborjs.org/docs/barnes-hut
https://jheer.github.io/barnes-hut/
https://people.eecs.berkeley.edu/~demmel/cs267/lecture26/lecture26.html

---

A feather using ...

---

A ribbon, fron, barbs, threads, fibers

---

# polygon items

ngon func
convert ngon to bezier splines

---

# point chord

a line within a point width, This can be done by

1. getting the _half way_ and projecting to the end.

We should be able to `p=Point(10,10, 100).getChord(slideOffset={x:20px,y:0}, rotation=this.rotation, distance=p.radius)`

This draws a chord (A Line) from the intersection of the edges.
It should be cheap, so we can draw a grid in a circle

## line to line chord.

Two lines define the limits of a chord. The chord Point defines the offset and angle.

+ 2 lines
+ 1 point

1. the point has a rotation to project in two directions

---

text editor

---

A div should follow a point, presenting text for example.

    x: 10
    y: 10
    rad: 3

a nice small overlay box with label and value. Perhaps a web component.
The div can follow a point XY by spying on the stage.

Within the div, spawn another canvas, perhaps a slice of the gridplane of the parent,

And connect a point within the child canvas to a point on the parent canvas. A dashed catenary curve would be nice.

This should present:

+ stage to div data coupling
+ Standard div overlays
+ point coupling through stage to stage.

---

the graph for followpoints can be a graph for general connections
It should also have a step method, to iterate per pair, per frame.
for loops, I should consider a 'visit map', where - (for one cycle) we can count
all visits across the tree. If a visit occurs more than X, we can kill it.

---

svg throughput

the same points should present in SVG. The drawing can be applied to both.

... Then also maybe divs soon somehow.

https://www.alt-codes.net/angle-symbols

---

https://pomax.github.io/bezierinfo/
https://bezier.method.ac/


---

text.string
    a simple string. no builtin formatting, no rotation
    just text
text.label
    can rotate, no builtin formatting
text.text