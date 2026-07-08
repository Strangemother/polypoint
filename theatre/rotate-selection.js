/*
title: Rotation Selection Tool
files:
    head
    point
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    stage
    ../point_src/distances.js
    pointlist
    ../point_src/events.js
    ../point_src/curve-extras.js
    dragging
    stroke
    ../point_src/random.js
    ../point_src/functions/clamp.js
    ../point_src/functions/within.js
    ../point_src/automouse.js
    ../point_src/windings.js
    ../point_src/recttools.js
---

Create a bounding box by click-dragging a selection.
*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        /* The (soon to be) generated lines */
        this.lines = []

        /* A flag for later */
        this.drawing = false

        /* A bunch of random points.*/
        this.points = PointList.generate.random(100,
                [800, 600],  // size
                {x: 100, y: 100} // top left
            )

        /* Box stroke. */
        this.stroke = new Stroke({
            color: '#5555FF'
            , width: 1
            , dash: [1]
        })

        /* populated when drawing */
        this.selected = new Set
        this.mouse.point.radius = 20
    }

    onClick(ev) {}

    onDblclick(ev) {}

    onMousedown(ev) {
        /* On mouse down, we flag the drawing as active and store the down Point */
        if(this.dragging.getPoint()?.uuid == 'handle'){
            // Dragging box mode.
            return
        }

        this.drawing = true
        this.downPoint = Point.from(ev)
        // this.selectItems()
    }

    onMouseup(ev) {
        /* On mouse up, flag the drawing=false, and store the up point. */
        this.drawing = false
        this.upPoint = Point.from(ev)
        // this.lines = []
    }

    onMousemove(ev) {
        /* On every move, creata a draw box from the down point
        to the mouse point, then test for selected items.*/
        if(!this.drawing) {
            return
        }

        /* render the concurrent box from downPoint to mousePoint*/
        let dp = this.downPoint
        let mp = this.mouse.point
        this.lines = twoPointBox(dp, mp)
        this.selectItems(dp, mp)
    }

    selectItems(a,b){

        let rect = twoPointsAsRectOrdered(a,b)
        let keep = new Set;

        let handList = new PointList(...rect)

        /* For every _point_ in the list, test to see if
        it's within the rectable polygon shape.
        If true, store the uuid of the point.*/

        let selections = new PointList
        this.points.forEach((p)=>{
            let within = withinPolygon(p , rect)
            if(within) {
                keep.add(p.uuid)
                selections.push(p)
            }
        })
        this.selected = keep

        /* build a handle for the center. */
        let handle = undefined
        if(keep.size > 1){
            handle = handList.centerOfMass()
            handle.rotationSet = function(v){
                console.log('rotation', v.toFixed())
                let spins = selections.handleRotate(handle)
            }

            handle.uuid = 'handle'
            this.dragging.add(handle)
        }

        this.handle = handle

        return keep
    }

    draw(ctx){
        this.clear(ctx)

        let ps = this.points;
        ps.forEach((p)=>{
            let selected = this.selected.has(p.uuid)
            p.pen.fill(ctx, selected? 'green':'#880000')
        })
        this.drawLines(ctx)
    }

    drawLines(ctx){
        if(this.downPoint && this.upPoint){

            // let mouseOver = withinPolygon(
            //                 this.mouse.point
            //                 , twoPointsAsRectOrdered(this.downPoint, this.upPoint)
            //             )
            let mouseOver = this.mouse.point.within.polygon(
                    twoPointsAsRectOrdered(this.downPoint, this.upPoint)
                )
            if(mouseOver) {
                this.mouse.point.pen.circle(ctx)
            }

            this.handle?.pen.indicator(ctx, '#ddd')
            // this.handle?.pen.fill(ctx, '#ddd')
        }

        this.stroke.wrap(ctx, ()=>this.lines.forEach(l=>l.render(ctx)))
        // this.stroke.set(ctx)
        // this.lines.forEach(l=>l.render(ctx))
        // this.stroke.unset(ctx)
    }
}

stage = MainStage.go()
