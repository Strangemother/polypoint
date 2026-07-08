/*

A jiggle is like oscillation or _slow_ vibration, where a point motions relative
to an origin point.

Quick Example:

    // instantiate
    jiggle = new JiggleClass(options[, originPoint])
    // update
    let optional = { tick: 1 }
    jiggle.step(optional)
    // render
    jiggle.point.pen.fill(ctx, 'red')

## Usage

The `Jiggle` class may be utilised in two general methods.

Use an existing point as an origin:

    origin = stage.center.copy().update({radius: 20})
    const jiggler = new Jiggler(undefined, origin)

    // Dragging the origin results in a nicer drag
    stage.dragging.addPoints(origin)

    // Internal stepping
    jiggler.step()

    // grab the standard point
    jiggler.point.pen.fill(ctx, '#22BB55')

Alternatively use it independent of an origin:

    const jiggler = new Jiggler() // origin position = {x:0, y:0}
    jiggler.step() // will update the jiggler.point

    // update with additional
    let jiggledPoint = jiggler.point.add(this.center.copy())
    jiggledPoint.pen.fill(ctx, '#22BB55')

## Options

The `Jiggle` class assigns a few options for the 2D oscillation

    options = {
        width: 3
        , height: 3
        , speedReducer: .2
        , xSpeed: .7
        , ySpeed: .5
    }

### width/height

Define the limits (in standard units, which are probably pixels.) of which the
oscillation can occur through its full range of motion on an axis.

For example `100` would define `100px` of movement across the axis through a period of time.

### xSpeed/ySpeed

The step amount computed by the given `tick` value. Each axis has its own speed.
Both are manipulated by the `speedReducer`

### speedReducer

A float of `0` to `1` to reduce the two `x` and `y` speed.

For example a `speedReducer` of `1` does not change the speed values. a value of
`0.5` would have the `xSpeed` and `ySpeed` value.

---

When manipulating the point (such as dragging), consider altering an _origin_ point
rather than the `Jiggle.point`, as the internal _point_ is not stable to changes.
and would cause erratic changes when apply custom motion

*/

const standardJiggle = function(jiggler, options){
    let o = options
    return {
        x: (Math.cos(o.ticker * (o.speedReducer * o.xSpeed)) * o.width)
        , y: (Math.sin(o.ticker * (o.speedReducer * o.ySpeed)) * o.height)
    }
}


class Jiggler {
    // Like a Vibration but more fun words.
    constructor(options, originPoint={x: 0, y: 0}) {

        this.options = Object.assign(this.getDefaults(), options)

        this.origin = this.options.origin || (new Point(originPoint))

        this.ticker = 0
        this.point = this.origin.copy()
    }

    getDefaults(){
        const defaults = {
            /* defaults */
            speedReducer: .2
            , xSpeed: .7
            , ySpeed: .5
            , width: 3
            , height: 3
            , callers: [standardJiggle]
        }

        return defaults
    }

    step(options={tick:1}) {
        let tick = options.tick
        options.ticker = this.ticker += (tick == undefined? 1: tick)
        const a = this.point
        const origin = this.origin

        a.radius = origin.radius
        a.update(this.getJiggle(origin, options))
    }

    getJiggle(lock=this.origin, options) {

        const o = Object.assign({}, this.options, options)
        const res = {x:0, y:0}
        const m = function(xy) {
            res.x += xy.x
            res.y += xy.y
        }

        o.callers.forEach(f=> m(f(this, o)))

        return {
            x: lock.x + res.x
            , y: lock.y + res.y
        }
    }
}


class PointJiggler extends Jiggler {

    constructor(point){
        super(null, point)
        // this.origin = point
        // this.opts = Object.assign(this.getDefaults(), options)
        this.point = point.copy()
    }
}


Polypoint.head.deferredProp('Point',
    function jiggler() {
        return new PointJiggler(this)
    }
);

