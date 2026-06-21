/*
title: Motion Blur
---

Mimic motion blur using a set of lerped lines:

    let point = new Point()
    point.motion.linear(ctx)

*/

class MotionBlur {
    /* The `MotionBlur` class provides a point relative clean abstraction for
    psuedo motion blur on a single point.

    With the extended prop:

        myPoint.motion.linear(ctx)

    Standalone:

        const ml = new MotionBlur(myPoint)
        ml.motion.linear(ctx)

    */

    constructor(p){
        /*
        Create a new motion blur instance. Provide a `Point` instance.

            new MotionBlur(targetPoint)

        */
        this.point = p
        this.tick = 0
        this._last1 = this.point.copy()
        this._last0 = this.point.copy().subtract(20)
    }

    linear(ctx) {
        /*
        Render a _linear_ line motion blur for a single point. The default
        settings are scaled to present a pleasing motion blur using two
        drawn lines.
        */
        let speed = 1
        if(this.tick % 1 == 0) {
            let current = this.point//.copy()
            // this._last1 = this._last0
            // this._last0 = current
            this._last1 = this._last1.lerp(this._last0, speed * .14)
            this._last0 = this._last0.lerp(current, speed * .34)
            // ctx.lineCap = 'round'
        }

        let p = this.point
        this._last1.pen.line(ctx, this._last0, '#11000055', p.radius * 1.7)
        this.point.pen.line(ctx, this._last0, p.color, p.radius * 2)
        // this._last1.pen.fill(ctx, 'red')
    }
}


class ListMotionBlur {

    constructor(ps){
        /*
        Create a new motion blur instance. Provide a `Point` instance.

            new MotionBlur(targetPoint)

        */
        this.points = ps
        this.tick = 0
        // this._last1 = this.point.copy()
        // this._last0 = this.point.copy().subtract(20)
        this.pointMap = new Map()
    }

    getPointMotion(p) {
        let pm = this.pointMap;
        let m;
        if(!pm.has(p)) {
            m = new MotionBlur(p)
            pm.set(p, m)
            return m
        }
        return pm.get(p)
    }

    linear(ctx) {
        this.points.forEach(p=>{
            let mp = this.getPointMotion(p)
            mp.linear(ctx)
        })
    }

    linearPoint(ctx, point) {
        /*
        Render a _linear_ line motion blur for a single point. The default
        settings are scaled to present a pleasing motion blur using two
        drawn lines.
        */
        let speed = 1
        if(this.tick % 1 == 0) {
            let current = point//.copy()
            // this._last1 = this._last0
            // this._last0 = current
            this._last1 = this._last1.lerp(this._last0, speed * .14)
            this._last0 = this._last0.lerp(current, speed * .34)
            // ctx.lineCap = 'round'
        }

        let p = point
        this._last1.pen.line(ctx, this._last0, '#110000', p.radius * 1.7)
        point.pen.line(ctx, this._last0, p.color, p.radius * 2)
        // this._last1.pen.fill(ctx, 'red')
    }
}

Polypoint.extend.prop('Point',
    /* Get a motion blur instance for this point.

    return `MotionBlur` A new MotionBlur instance once.
    */

    function motion() {
        return new MotionBlur(this)
    }
);

Polypoint.extend.prop('PointList',
    /* Get a motion blur instance for this point.

    return `MotionBlur` A new MotionBlur instance once.
    */

    function motion() {
        return new ListMotionBlur(this)
    }
);
