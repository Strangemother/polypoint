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

class Dragging extends Distances {

    /* click Down<>Up ms delta,*/
    clickSpeed = 300
    clickDragDeadzone = undefined // undefined == 1 radius

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
        this._near = new Point(mouse.position);
    }

    add(point) {
        return this.addPoints(point)
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
        this.downPointDistance = new Point(this._near.distance2D(this.mousedownOrigin))
        this._mousedown = true
        this.onDragStartHandler(ev)
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
            this._near = this.intersect(stage.mouse.position, 10)
            // this.near = this.dis.within(100, this.mouse.position)
            // this._near = this.near(stage.mouse.position, 100)[0]
            return
        }

        // Add translation to selected
        // let v = this.nearOrigin.add(ev.x, ev.y)
        this.onDragMoveHandler(ev)
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
        this.onClick(ev)
    }

    onClick(ev) {}

    onDragMoveHandler(ev) {
        this.onDragMove(ev)
        this.applyXY(ev.x, ev.y)
    }

    onDragStartHandler(ev){
        this.isDragging = true
        this.onDragStart(ev)
    }

    onDragStart(ev){}
    onDragMove(ev) {}
    onDragEndHandler(ev){
        this.onDragEnd(ev)
        this.isDragging = false
    }
    onDragEnd(ev){}
    applyXY(x,y){
        let offsetSelected = this.downPointDistance.add(x, y)
        this._near.set(offsetSelected.x, offsetSelected.y)
    }


}

