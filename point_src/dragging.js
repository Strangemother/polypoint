/*
Dragging tool performs distance tests for all applied points.

    drag = new Dragging
    drag.initDragging(this)
    drag.onDragMove = this.onDragMove.bind(this)
    drag.onDragEnd = this.onDragEnd.bind(this)

Install points into the map:

    drag.addPoints(this.center, this.point0, this.point1)

Upon a mouse action we can access the discovered points.

        let p = drag.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }

 */


/*
Poly.mixin()
Poly.Point()
Poly.PointList()
Poly.functions.graient


Polypoint.head.mixin()
Polypoint.head.Point()
Polypoint.head.PointList()
Polypoint.head.functions.graient */

/*The mixin hot-loads functions and objects into the classy head.
The target can be a string or root entity.

For example, providing a function to the Point class

    Point.prototype.constructor.prototype.myfunc = function() {
        console.log('myfunc', this)
    }

    stage.center.myfunc()
    "myfunc", Point,...

    The addon may be a dict or function
    If a function, accept the target:

        'Point', function(Point){
            Point.prototype.constructor.prototype.myfunc = ()=>{}
        }

    or return a object to assign as the overload:

        'Point', function(Point){
            return { myfunc(){} }
        }

*/


Polypoint.head.mixin('Point', {

    _draggable: {
        value: true,
        writable: true
    }

    , draggable: {
        get() {
            return this._draggable
        }
        // value: {
        // }
    }
})


/*
Polypoint.mixin('Stage', {
    dragging: {
        value: {
            get enabled() {
                return 'foo'
            }

            , set enabled(value) {
                console.log('Active', value)
            }
        }
    }
})*/


class Dragging extends Distances {

    /* click Down<>Up ms delta,*/
    clickSpeed = 300
    clickDragDeadzone = undefined // undefined == 1 radius
    maxWheelValue = 500
    padding = 10

    constructor(stage) {
        super()
        this.stage = stage;
        this.isDragging = false
    }

    initDragging(stage=this.stage){
        let c = stage.canvas
            , mouse = stage.mouse
            ;
        mouse.listen(c, 'mousedown', (c,ev)=> this.onMousedown(stage,c,ev))
        mouse.listen(c, 'mousemove', (c,ev)=> this.onMousemove(stage,c,ev))
        mouse.listen(c, 'mouseup', (c,ev)=> this.onMouseup(stage,c,ev))
        mouse.listen(c, 'wheel', (c,ev)=> this.onWheelInternal(stage,c,ev), {passive: true})
        this._near = new Point(mouse.position);
    }

    add(point) {
        return this.addPoints.apply(this, arguments)
    }

    onMousedown(stage, canvas, ev) {
        // register point
        // Select near
        this._mousedownDelta = +(new Date)
        this.mousedownOrigin = {x:ev.x, y:ev.y}

        // this.nearOrigin = this.near.copy()
        if(this._near == undefined) {
            console.log('not near any point at position', this.mousedownOrigin)
            return
        }

        let distanceValue = this.distanceValue = this._near.distance2D(this.mousedownOrigin)
        this.downPointDistance = new Point(distanceValue)
        this._mousedown = true
        this._grabbingId = this.stage?.cursor.set('grabbing', this._cursorId)

        // if(this.withinBufferZone(this.downPointDistance)) {
        //     this.onEdgeStartHandler(ev)
        // } else {
            this.onDragStartHandler(ev)
        // }

    }

    getPoint(){
        /* return the point previously discovered.*/
        return this._near
    }

    onMousemove(stage, canvas, ev) {
        if(!this._mousedown) {
            // present the possible nearest
            // this._near = this.closest(stage.mouse.position, 100)
            // this._near = this.closest(stage.mouse.position, (v,p)=> v<=p.radius)
            const found = this.intersect(stage.mouse.position, this.padding)
            this._near = found
            this.cursorChange(found)
            // this.near = this.dis.within(100, this.mouse.position)
            // this._near = this.near(stage.mouse.position, 100)[0]
            return
        }

        // Add translation to selected
        // let v = this.nearOrigin.add(ev.x, ev.y)
        this.onDragMoveHandler(ev)
    }

    cursorChange(found) {
        if(found) {

            /* perform cursor magic */
            if(this._stackedCursor === true) {
                // nothing to do; mouse is stacked.
            } else {
                this._emitCursorHover()
            }

            return
        }

        if(this._stackedCursor === true) {
            this._emitCursorRelease()
        }/* else {
            // nothing to do; mouse is released.
        }*/

    }

    _emitCursorHover() {
        this._stackedCursor = true
        // console.log('enable hover')
        this._cursorId = this.stage?.cursor.set('grab')
    }

    _emitCursorRelease() {
        this._stackedCursor = false
        let id = this._cursorId
        // console.log('disable hover', id)
        this.stage?.cursor.unset(id)
    }

    onMouseup(stage, canvas, ev) {
        this._mousedown = false;
        let nowDelta = +(new Date)
        let delta = nowDelta - this._mousedownDelta
        let isClick = delta <= this.clickSpeed
        let minDistance = this.clickDragDeadzone
        if(minDistance == undefined) {
            minDistance = 20
        }

        let dis = this.dragDistance(ev)
        let withinClickDelta = dis < minDistance
        // console.log('Click Speed =', delta, 'distance', dis, 'is click:', isClick)

        if(this._grabbingId != undefined) {
            this.stage.cursor.unset(this._grabbingId)
            this._grabbingId = undefined
        }

        if(isClick && (withinClickDelta)) {
            // If the distance was greater than the max,
            // it's actually a drag
            return this.onClickHander(stage, canvas, ev)
        }

        if(!withinClickDelta) {
            // console.log('This was a drag', dis)
            return this.onDragEndHandler(ev)
        }

        this.onLongClick(stage, canvas, ev, delta)
    }

    onWheelInternal(stage, canvas, ev) {
        let n = this._near;
        if(!n) { return };

        let size = event.wheelDelta
        let positive = size > 0
        let compute = Math.abs(size * .01)
        let radius = n.radius;
        let rad = positive? radius*compute: radius/compute;
        n.radius = clamp(rad, 1, this.maxWheelValue)
        n.onResize && n.onResize(ev, stage, canvas)
        this.onWheel(ev, n)
    }

    onLongClick(stage, canvas, ev, delta) {
        console.log('Long Click (not dragged)', delta)
    }

    /* Given the EV with a {x,y}, return the distance from the origin mousedown. */
    dragDistance(ev) {
        if(!this.mousedownOrigin) {
            console.log('! no mouse origin')
            return 0
        }
        let v = distance(this.mousedownOrigin, ev)
        // console.log('dragDistance value=', v)
        return v
    }

    onClickHander(stage, canvas, ev) {
        // console.log('That was a click not a drag...')
        //
        if(this.isEdgeDragging == true) {
            this.onEdgeEnd(ev)
        }
        this.onClick(ev)
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    onClick(ev) {}
    onDragStart(ev){}
    onDragMove(ev) {}
    onDragEnd(ev){}
    onWheel(ev, point){}

    onEdgeStart(ev) {
        console.log('onEdgeStart')
    }

    onEdgeMove(ev) {
        // console.log('onEdgeMove')

    }

    onEdgeEnd(ev) {
        console.log('onEdgeEnd')
    }

    onDragMoveHandler(ev) {
        if(this.isDragging) {
            this.applyXY(ev.x, ev.y)
            this.onDragMove(ev)
        }

        if(this.isEdgeDragging == true) {
            this.onEdgeMove(ev)
        }
    }

    onDragStartHandler(ev){
        this.isDragging = true
        this.onDragStart(ev)
    }

    onEdgeStartHandler(ev) {
        this.isEdgeDragging = true
        this.onEdgeStart(ev)
    }


    withinBufferZone(distancePoint, buffer=this.padding) {
        // distance
        let v = this.distanceValue.distance
        return v > this._near.radius
    }

    onDragEndHandler(ev){
        if(this.isDragging) {
            this.isDragging = false
            this.onDragEnd(ev)
        }


        if(this.isEdgeDragging == true) {
            this.isEdgeDragging = false
            this.onEdgeEnd(ev)
        }
    }

    applyXY(x,y){
        let offsetSelected = this.downPointDistance.add(x, y)
        this._near.set(offsetSelected.x, offsetSelected.y)
    }
}


class CursorStack {
    /*stash and pop cursor states.
        id = cursor.set(name)
        cursor.unset(id)
    */

    constructor(stage) {
        // this.current = 'default'
        this.icon = 'default'
        this.map = new Map;
        this.stage = stage

    }

    set(name, parallelUnset) {
        // console.log('set cursor')
        let uuid = Math.random().toString(32)
        // if(parallelUnset) {
        //     this.unset(parallelUnset, true)
        // }
        // this.map.set(uuid, [name, this.icon])
        // this.current = uuid
        this.icon = name
        // console.log('set', this.icon)
        this.setMouseIcon(this.icon)
        return uuid
    }

    setMouseIcon(icon){
        this.stage.canvas.style.cursor = icon
    }

    unset(uuid, perform=true) {
        // console.log('unset cursor', uuid)
        // let [name, now] = this.map.get(uuid)
        // this.current = now
        this.icon = 'default'

        // console.log('revert to', this.icon)
        // if(perform) {
            this.setMouseIcon(this.icon)
        // }
    }

}


Polypoint.head.lazierProp('Stage', function cursor(){
    return new CursorStack(this);

    // let dr = this._cursor
    // if(dr == undefined) {
    //     console.log('Returning new lazyProp "CursorStack"')
    //     dr = this._cursorStack = new CursorStack
    //     // dr.initDragging(this)
    // }
    // return dr
});


/* The Stage.dragging utility automatically creates and initates Dragging
when required.

    stage = new Stage;
    stage.dragging.add(new Point(100, 100))
*/
Polypoint.head.lazierProp('Stage', function dragging(){
    console.log('Returning new lazyProp "Dragging"')
    let dr = new Dragging(this)
    dr.initDragging();

    return dr
});


;Polypoint.head.install(Dragging);
