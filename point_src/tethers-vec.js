/*
files:
    ./windings.js
 */


const relPolarXY = function(primaryPoint, controlPoint, distance, spinRads) {
    /*
    get xy of the control point, relative to the {X,Y, Rot} of point A,
    using distance and relative angle.
     */
    // const primaryPoint = { x: 10, y: 10, radians: 1 };
    if(distance == undefined){
        distance = primaryPoint.distance2D(controlPoint)
    }
    const relative = { distance, spinRads };

    const totalRads = primaryPoint.radians + relative.spinRads;
    const dx = distance.x
          , dy = distance.y;

    const xRot = dx * Math.cos(totalRads) - dy * Math.sin(totalRads);
    const yRot = dx * Math.sin(totalRads) + dy * Math.cos(totalRads);

    return [primaryPoint.x + xRot, primaryPoint.y + yRot]
}


class PointTethers {
    /* Given a parent, bind a range of points by distance position.
    Call _step_ when visual updates are required.

        this.point = new Point(200, 200, 100)
        let cp = this.point.tethers.add({ x: 100, y: 50})

    Step:

        this.point.tethers.step()

    Render:

        this.point.pen.indicator(ctx, {color: '#336600'})
        this.point.tethers.points.pen.fill(ctx, '#33DDAA')
    */
    computeFunc = 'polar'
    constructor(point) {
        this.parent = point
        this.points = new PointList
        this.keepRotate = true
        this.windings = new PointWinding(this.parent)
    }

    add(pointData) {
        let cp = this.generate.apply(this, arguments)
        this.push(cp)
        return cp
    }

    onTipDragStart(ev) {
        let p = this.parent
        p.onTipDragStart && p.onTipDragStart.apply(p)
    }

    onTipDragMove(ev) {
        let p = this.parent
        p.onTipDragMove && p.onTipDragMove.apply(p)
    }

    onTipDragEnd(ev) {
        let p = this.parent
        p.onTipDragEnd && p.onTipDragEnd.apply(p)
    }

    generate(pointData) {
        /* Generate, store and return a new controller point */
        let _self = this;
        let point = this.parent
        let controlPoint;

        if(arguments.length == 0) {
            controlPoint = point.project()
        } else {
            controlPoint = new Point(...Array.from(arguments))
        }

        let record = function(cp, pp) {
            cp.controlPointsDistance = cp.distance2D(pp)
            cp.relRads = degToRad(calculateAngle360(pp, cp))
            // cp.radiansDiff = calculateAngleDiffWrapped(pp, cp)
        }

        record(controlPoint, point);

        controlPoint.onDragStart = function() {
            this._release = true;
            _self.onTipDragStart.apply(_self, arguments)
        }

        controlPoint.onDragMove = function() {
            record(this, point)
            _self.onTipDragMove.apply(_self, arguments)
        }

        controlPoint.onDragEnd = function() {
            // this.relRads = wrapRadians(v - point.radians);      // <- convert to local
            // function wrapRadians(t) {
            //   t = (t + Math.PI*2) % (Math.PI*2);
            //   return t < 0 ? t + Math.PI*2 : t;
            // }

            record(this, point)
            let v = degToRad(calculateAngle360(point, this))
            /* Ooft, took me a while.
            world to local mapping needs correcting.
            */
            this.relRads -= v + point.radians

            this._release = false;
            _self.onTipDragEnd.apply(_self, arguments)
        }

        return controlPoint
    }

    push(controlPoint) {
        this.points.push(controlPoint)
    }

    step(rotation=this.keepRotate){
        /* Unless the user is in control,
        Move any control point to the correct location,*/
        let pp = this.parent
        let computeFunc = this[`compute_${this.computeFunc}`]
        this.points.forEach((p,i)=>{
            if(p._release == true) { return } // mouse is down.
            p.xy = computeFunc(p, pp)
            // /* relative polar placement */
            // p.xy = relPolarXY(pp, p, p.controlPointsDistance, p.relRads)
            // /* relative xy position */
            // p.xy = this.point.add(p.controlPointsDistance).xy
        })
    }

    compute_polar(controlPoint, primaryPoint=this.parent) {
        /* relative polar placement */
        return relPolarXY(primaryPoint
                , controlPoint
                , controlPoint.controlPointsDistance
                , controlPoint.relRads)
    }

    compute_static(controlPoint, primaryPoint=this.parent){
        /* relative xy position */
        return primaryPoint.add(controlPoint.controlPointsDistance).xy
    }
}

Polypoint.head.deferredProp('Point', function tethers() {
        return new PointTethers(this)
    }
)