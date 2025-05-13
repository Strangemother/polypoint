/*
---
title: Dragging
dependencies:
    distances.js
files:
    protractor.js
    text/beta.js
---

Dragging tool performs distance tests for all applied points.

    const drag = new Dragging
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


Polypoint.head.mixin('Point', {
    /* Every point gains a _draggable_ property. By default `draggable=true` */
    _draggable: {
        value: true,
        writable: true
    }

    , draggable: {
        get() {
            return this._draggable
        }

        , set(v) {
            this._draggable = false
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

    /* Perform point rotation on on mouse _right_ down.
    False disables this in favour of a contextmenu */
    twistMouse = true

    constructor(stage) {
        super()
        this.stage = stage;
        this.isDragging = false
        this.toy = new Point()
        this.toy2 = new Point({ radius: 10})
    }

    initDragging(stage=this.stage){
        let c = stage.canvas
            , mouse = stage.mouse
            ;

        if(mouse == undefined) {
            console.error('automouse is not imported. Cannot listen to mouse actions.')
            return
        }
        mouse.listen(c, 'mousedown', (c,ev)=> this.onMousedown(stage,c,ev))
        mouse.listen(c, 'mousemove', (c,ev)=> this.onMousemove(stage,c,ev))
        mouse.listen(c, 'mouseup', (c,ev)=> this.onMouseup(stage,c,ev))
        mouse.listen(c, 'wheel', (c,ev)=> this.onWheelInternal(stage,c,ev), {passive: true})
        mouse.listen(c, 'contextmenu', (c,ev)=> this.onContextMenu(stage,c,ev)/*, {passive: true}*/)

        this._near = new Point(mouse.position);
    }

    add(point) {
        return this.addPoints.apply(this, arguments)
    }

    set(many) {
        return this.setPoints.apply(this, arguments)
    }

    onMousedown(stage, canvas, ev) {
        // register point
        // Select near
        return this.primaryActionDown.apply(this, arguments)
    }

    primaryActionDown(stage, canvas, ev){
        /* Capture the down event for the primary mouse button (likely button #0)*/
        this._mousedownDelta = +(new Date)
        this.mousedownOrigin = {x:ev.x, y:ev.y, radius: 20}

        // this.nearOrigin = this.near.copy()
        if(this._near == undefined) {
            console.log('not near any point at position', this.mousedownOrigin)
            return this.emptyMouseDown(stage, canvas, ev)
        }

        this.mousedownRotationTool(ev)

        let distanceValue = this.distanceValue = this._near.distance2D(this.mousedownOrigin)
        this.downPointDistance = new Point(distanceValue)
        this._mousedown = true
        this._grabbingId = this.stage?.cursor.set('grabbing', this._cursorId)

        this.callPointHandler('onMousedown', ev, this._near)
        // if(this.withinBufferZone(this.downPointDistance)) {
        //     this.onEdgeStartHandler(ev)
        // } else {
        if(this._near.draggable){
            this.onDragStartHandler(ev, this._near)
        }
        // }

    }

    emptyMouseDown(stage, canvas, ev) {
        console.log('Empty click', stage, ev)
        this.callDoubleHandler('onEmptyDown', ev)
        stage.onEmptyDown && stage.onEmptyDown(ev)
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
            this.callPointHandler('onMousemove', ev, found)

            // this.near = this.dis.within(100, this.mouse.position)
            // this._near = this.near(stage.mouse.position, 100)[0]
            return
        }

        let isRightClick = this.isRightClickOkay(ev)
        // Add translation to selected
        // let v = this.nearOrigin.add(ev.x, ev.y)
        if(ev.shiftKey || isRightClick){
            this.onShiftMouseMoveHandler(ev)
            this.didSpin = true
        } else {
            this.onDragMoveHandler(ev)
        }
    }

    isRightClickOkay(ev){
        return (this.twistMouse && (ev.which == 3))
    }

    mousedownRotationTool(ev){
        this.mousedownPoint = Point.from(ev)
        this.mousedownPoint.rotation = this._near.rotation
        this.mousedownPoint.radius = 20
        // this.mousedownOrigin.radians = this._near.radians
        this.mousedownOrigin.rotation = this._near.rotation
    }

    onShiftMouseMoveHandler(ev){
        /* the point should _spin_ rather than move. */
        // ev angle To mouse from origin angle.
        let spinX = this._near.x // this.mousedownOrigin.x
        let spinY = this._near.y // this.mousedownOrigin.y
        let targetCenter = new Point(spinX, spinY);
        let mousePos = stage.mouse.position;
        let downPoint = this.mousedownPoint
        // let rads= calculateAngleDiff(primaryPoint, secondaryPoint)

        let rot = calculateAngle360(targetCenter, mousePos, downPoint.rotation)
        this.toy.update({
                x: spinX
                , y: spinY
                , radius: 20
                // x: this.mousedownPoint.x
                // , y: this.mousedownPoint.y

                /* Add the original origin (the mousedown store of the target)
                rotation, else the result starts from `0` pointing right.
                But we want `0` to originate from the start angle (the big target) */
                , rotation: rot + this.mousedownOrigin.rotation
            })
        this.toy2.update({
                x:spinX
                , y:spinY
                , radius: 20
            }).lookAt(downPoint)
        /* We want to calculate the difference between the angle to the mousedown,
        to the current mouse, with the _origin_ as the center of the big point. */
        let nrot = calculateAngleDiff(this.toy, this.toy2)
        this.toy.text && (this.toy.text.value = nrot.toFixed(0))
        this._near.rotation = downPoint.rotation + nrot
        // this.mousedownOrigin.radians
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

        this.callPointHandler('onMouseup', ev)

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
        if(!n) { return this.onWheelEmpty(ev)};

        let size = event.wheelDelta
        let positive = size > 0
        let compute = Math.abs(size * .01)
        let radius = n.radius;
        let rad = positive? radius*compute: radius/compute;
        n.radius = clamp(rad, 1, this.maxWheelValue)
        n.onResize && n.onResize(ev, stage, canvas)
        // this.onWheel(ev, n)
        this.callDoubleHandler('onWheel', ev, n)
    }

    onLongClick(stage, canvas, ev, delta) {
        console.log('Long Click (not dragged)', delta)
        this.callPointHandler('onLongClick', ev, this._near, delta)
        stage.onLongClick && stage.onLongClick(ev, delta)

    }

    getDownTimeTaken() {
        return +(new Date) - this._mousedownDelta
    }

    onContextMenu(stage,c,ev) {
        // mouse.listen(c, 'contextmenu', (c,ev)=> this.onContextMenu(stage,c,ev), {passive: true})
        let timeDown = this.getDownTimeTaken()

        if(this.twistMouse) {
            // console.log('cancel contextmenu? Time taken:', timeDown)
            let distance = this.mousedownPoint?.distanceTo(ev)
            if((distance && (distance > 10)) && timeDown > 100) {
                ev.preventDefault()
                return // show context
            }

            if(timeDown < 300) {
                return // allow short right click
            }
            // or the distance is far

            ev.preventDefault()
        }
    }

    /* Given the EV with a {x,y}, return the distance from the origin mousedown. */
    dragDistance(ev) {
        if(!this.mousedownOrigin) {
            console.log('! no mouse origin')
            return 0
        }
        let v = distance(this.mousedownOrigin, ev)
        return v
    }

    onClickHander(stage, canvas, ev) {
        // console.log('That was a click not a drag...')
        //
        if(this.isEdgeDragging == true) {
            this.onEdgeEnd(ev)
        }
        let p = this._near
        this.callDoubleHandler('onClick', ev, p)
    }

    callDoubleHandler(name, ev, p, x) {
        /* Given a function name shared by this instance, and the point,
        call the function with the event and arguments.

            callDoubleHandler('onClick', ev, point, ...)

        The function name must exist on this instance, optional on the point.
        */
        let args = [ev, p]
        if(x != undefined) {
            args = Array.from(arguments).slice(1)
        }

        this[name].apply(this, args)
        this.callPointHandler.apply(this, arguments)
    }

    callPointHandler(name, ev, p=this._near, x) {
        /* Call the method `name` on the point, with the event, _if_ the
        point contains the method.

            this.callPointHandler('onMousedown', ev, this._near)

        Apply any arguments after the _point_ to the event

            this.callPointHandler('onLongClick', ev, this._near, delta, { apples: 'green'})
        */
        let args = [ev]
        if(x != undefined) {
            args = args.concat(Array.from(arguments).slice(3))
        }
        p && p[name] && p[name].apply(p, args)
    }

    drawAll(ctx) {
        this.drawIris(ctx)
        this.drawTwists(ctx)
    }

    drawTwists(ctx) {
        this.toy2.pen.indicator(ctx, {color: 'black'})
        this.toy.pen.indicator(ctx, {color: 'red'})
        this.toy.text.label(ctx)
        this.mousedownPoint?.pen.indicator(ctx, {color: 'blue'})
    }

    drawIris(ctx) {
        /* The dynamic highlighter. */
        let p = this.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    onWheelEmpty(ev) {}
    onEmptyDown(ev) {}
    onClick(ev) {}
    onDragStart(ev, point){}
    onDragMove(ev) {}
    onDragEnd(ev, point){}
    onWheel(ev, point){}

    onEdgeStart(ev) {
        console.log('onEdgeStart', this._near)
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
            this.callDoubleHandler('onDragMove', ev)
        }

        if(this.isEdgeDragging == true) {
            this.onEdgeMove(ev)
        }
    }

    onDragStartHandler(ev, p){
        this.isDragging = true
        // this.onDragStart(ev, p)
        this.callDoubleHandler('onDragStart', ev, p)
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
            // this.onDragEnd(ev)
            this.callDoubleHandler('onDragEnd', ev, this._near)
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
