/*
files:
    ./windings.js
 */
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

    constructor(point) {
        this.point = point
        this.points = new PointList
        this.keepRotate = true
        this.windings = new PointWinding(this.point)
    }

    add(pointData) {
        let cp = this.generate.apply(this, arguments)
        this.push(cp)
        return cp
    }

    onTipDragStart(ev) {
        let p = this.point
        p.onTipDragStart && p.onTipDragStart.apply(p)
    }

    onTipDragMove(ev) {
        let p = this.point
        p.onTipDragMove && p.onTipDragMove.apply(p)
    }

    onTipDragEnd(ev) {
        let p = this.point
        p.onTipDragEnd && p.onTipDragEnd.apply(p)
    }

    generate(pointData) {
        /* Generate, store and return a new controller point */
        let _self = this;
        let point = this.point
        let controlPoint;

        if(arguments.length == 0) {
            controlPoint = point.project()
        } else {
            controlPoint = new Point(...Array.from(arguments))
        }

        controlPoint.controlPointsDistance = controlPoint.distance2D(point)
        controlPoint.onDragStart = function() {
            // console.log('Drag start')
            this._release = true;
            _self.onTipDragStart.apply(_self, arguments)
        }

        controlPoint.onDragMove = function() {
            // console.log('Drag move')
            this.controlPointsDistance = this.distance2D(point)
            _self.onTipDragMove.apply(_self, arguments)
        }

        controlPoint.onDragEnd = function() {
            // console.log('Drag end')
            this.controlPointsDistance = this.distance2D(point)
            this._release = false;
            _self.onTipDragEnd.apply(_self, arguments)
        }

        controlPoint.radiansDiff = calculateAngleDiffWrapped(point, controlPoint)
        return controlPoint
    }

    push(controlPoint) {
        this.points.push(controlPoint)
    }

    step(rotation=this.keepRotate){
        /* Unless the user is in control,
        Move any control point to the correct location,*/
        this.points.forEach((p,i)=>{
            let radiansDiff = calculateAngleDiffWrapped(this.point, p)
            if(p._release == true) { return }
            p.xy = this.point.add(p.controlPointsDistance).xy
        })
    }
}

Polypoint.head.deferredProp('Point', function tethers() {
        return new PointTethers(this)
    }
)