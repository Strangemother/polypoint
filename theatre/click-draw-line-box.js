/*
title: Draw Box
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/curve-extras.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/within.js
    ../point_src/automouse.js
    ../point_src/recttools.js
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.lines = []
        this.drawing = false
        this.events.wake()
        this.points = PointList.generate.random(100, [800, 600], {x: 100, y: 100})
        this.stroke = new Stroke({
            color: '#5555FF'
            , width: 1
            , dash: [1]
        })

        this.selected = new Set
        this.mouse.point.radius = 20
    }

    onClick(ev) {
    }

    onDblclick(ev) {

    }

    onMousedown(ev) {
        this.drawing = true
        this.downPoint = Point.from(ev)
        // this.selectItems()
    }

    onMouseup(ev) {
        this.drawing = false
        this.upPoint = Point.from(ev)
        // this.lines = []
    }

    onMousemove(ev) {
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
        this.points.forEach((p)=>{
            let within = withinPolygon(p , rect)
            if(within) {
                keep.add(p.uuid)
                // handList.push(p)
            }
        })
        this.selected = keep
        let handle = undefined
        if(keep.size > 1){
            handle = handList.centerOfMass()
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

            this.handle?.pen.fill(ctx, '#ddd')
        }

        this.stroke.set(ctx)
        this.lines.forEach(l=>l.render(ctx))
        this.stroke.unset(ctx)


    }
}

stage = MainStage.go()
