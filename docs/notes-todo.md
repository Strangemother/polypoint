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

---

Car stuff:

+ https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
+ https://github.com/spacejack/carphysics2d/tree/master
+ https://entertain.univie.ac.at/~hlavacs/publications/car_model06.pdf

Links:

+ https://natureofcode.com/
+ https://wumbo.net/
+ https://thirdspacelearning.com/gcse-maths/
https://online-learning-college.com/knowledge-hub/gcses/gcse-maths-help/tangent-properties/
https://www.fxhash.xyz/article/behind-the-algorithm%3A-buizen-generating-tubes-with-arc-tangent-math
http://www.geometrycommoncore.com/content/unit5/gc2/teachernotes1.html
https://www.waeconline.org.ng/e-learning//Technical/Td223Mq3.html
https://github.com/subprotocol/verlet-js/tree/master
https://www.youtube.com/watch?v=hpiILbMkF9w&ab_channel=NoBSCode
https://www.youtube.com/watch?v=CceepU1vIKo&ab_channel=NoBSCode


https://pomax.github.io/bezierinfo/
https://windowjs.org/
https://www.glfw.org/
https://www.svgrepo.com/svg/425335/mouse


---


    import {exp, e, pow, log} from 'mathjs'

    export function sigmoid(x, derivative) {
        let fx = 1 / (1 + exp(-x));
      if (derivative)
            return fx * (1 - fx);
        return fx;
    }

    export function tanh(x, derivative) {
        let fx = 2 / (1 + exp(-2 * x)) - 1;
        if (derivative)
            return 1 - pow(fx, 2);
        return fx;
    }

    export function relu(x, derivative) {
        if (derivative)
            return x < 0 ? 0 : 1;
        return x < 0 ? 0 : x;
    }

    export function softplus(x, derivative) {
        if (derivative)
            return 1 / (1 + exp(-x));
        return log(1 + exp(x), e);
    }






