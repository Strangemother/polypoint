# Emitter

produce and eject points from a point, line, or curve

---

+ Project through 360 degrees of a point
+ Optionally apply an arc to project through

This can work with lines and splines, using the `split` lerp functionality, to select a location along the line to project.

points should recycle after death.

---

https://github.com/timohausmann/quadtree-js/blob/master/quadtree.js
https://timohausmann.github.io/quadtree-js/dynamic.html




---

https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain#Python
https://stackoverflow.com/questions/57637537/implementing-quadtree-collision-with-javascript
https://carlosupc.github.io/Spatial-Partitioning-Quadtree/


----

https://d3js.org/d3-selection/events
http://mathonline.wikidot.com/reflection-transformations#toc2
https://mofu-dev.com/en/blog/stable-fluids/#vector-calculus

---

plotting

Draw at the distance from the 'current' point.
_release_ the current and produce a ghost point at the mouse.

if the mouse leaves the scroll wheel radius create a point
If the point is within the radius; ghost point

If the last ghost point did not resolve a current point
then stepping _back_ into the radius of the previous point, converts it to a ghost point.

    if(lastPoint was ghost lost) {
        thisPoint.setAsGhost()
    }

---

singleton classes for drawing tools

+ rather than a point spawn a new pen, use an existing one with an altered context.

---

Inplace mutation for point values.

Apply a mutator on values for a point. They manipulate a value upon read without
changing the original value

```js
point.mutator.x.add((v)=>v * v)
```

---

Point interection, with radius multipoint test.


---

A simple ValueProxy, To capture a value and return a special. A PointProxy could probably do more

wanted:

```js
point = new Point(100, 200)
pp = Proxy(point, {
    x(v) { return v + 10
}})
pp.x == 110
```

likely impossible:

```js
point = new Point(100, 200)
x = proxy(point.x, (v)=>v+10)
point.x == 100
x == 110
```

---

stage.track

    Track a point, moving all other _tracked_ points relatively.

stage.leash

    leash a point, move others relative to the motion in rope constraint "leash" function
    This should be moving the camera in a leash style, when the point moves away from the center.
    E.g. the point is leashed by 100; moves 110, the scene moves 10, the point stays within 100.

---

## Cutting

A user should be able to _cut_ a line, or curve, using another line (or point along the target line) as a the knife.
The split divides the given line into two distinct lines, and each line continues the projection as expected.

This is easy for straight lines, as they slice linearly.
And Circles are fairly arbitrary

splines are more difficult, requiring lerping to slice, then  projecting new control
points, such that the new points produce curve matching the old curve - but as two
distance lines.

---

With cutting, a user can cut a line, select other points and merge.
reorder the pointlist by distance (relative)
draw a line along them to generate a new shape.