# Notes

Some notes, considerations and improvements.


## PolyPoint Head

Perhaps an import head to store all functions

```js
Poly.Point
Poly.functions.saveRestoreDraw
Poly.math.PI_2
```

+ offcanvas rendering
+ threads and processes for off-canvas loops.

+ auto concat the polypoint
+ Consider if functional hash map chains is faster than functional calls
+ Event central

Generally polypoints should move towards an actor <> runtime engine, where all
Stage integrations perform actor operations on a stage runtime, rather than the current, _point-centric_ methodology.

This will provide better resource management, and coupled values.

+ variable numbers.
    Couple a percent with some number to compute dynamic variables:

```js
// 40% from top-left.
point.x = var("40%", stage.point)
```

+ Natural elements
    some elements can be applied to a point. The values may be lazy.

    + Velocity
    + Pens and drawing
    + siblings
        parent, child
        previous, next

    A point should be able to relatively move from its origin, such as wobbling on a point, using the original location as a reference.
+ forced _at_ and _from_
    Allow the impart of forces, including torque and velocity.

