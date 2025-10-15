/*
---
title: Zooming Points
src_dir: ../point_src/
categories: scaling
files:
    ../point_src/math.js
    ../point_src/core/head.js
    point
    pointlist
    mouse
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    stroke
    dragging
    ../point_src/zoom.js
---

Zoom many points.
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        let radius = 7
        let count = 200
        const pointList = PointList.generate.random(count, 600, {x: 300, y:100})
        pointList.each.color = ()=>random.color([100, 230], [40,80], [40,60])
        this.factor = 1.2

        pointList.forEach(p=>p.radius = random.int(2, 5))
        this.points = pointList
        this.dis = new Distances
        this.dis.addPoints(...pointList)

        this.zoom = new Zoom(this, pointList)
        // this.zoom.lens = 10
        // this.zoom.add(...pointList)

        this.dragging.add(...pointList)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
        this.dragging.onWheelEmpty = this.onWheelEmpty.bind(this)
        this.events.wake()

        this.isPanning = true
        this.innerZoom = 1
        this.origin = this.center.copy()
        this.zoom.update(this.origin, this.factor)

    }

    onWheelEmpty(ev) {
        this.innerZoom += ev.deltaY
        let factor = this.factor = 1 + (this.innerZoom * -.001)
        console.log(factor)
        if(this.origin) {
            this.zoom.update(this.origin, factor)
        }
    }

    onEmptyDown(ev) {
        // console.log('onEmptyDown')
        this.isPanning = true
        this.origin = Point.from(ev)
        this.zoom.update(this.origin, this.factor)
    }

    onMousemove(ev) {
        if(!this.isPanning) {
            return
        }

        this.origin.copy(this.mouse.position)
        // let d = Point.from(ev).distance2D(this.origin)
        // console.log('Pan', d)
    }

    onMouseup(ev) {
        this.isPanning = false
    }

    draw(ctx){
        this.clear(ctx)
        if(this.origin){
            this.zoom.update(this.origin, this.factor)
        }

        let mousePoint = Point.mouse.position
        this.points.lookAt(mousePoint)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.circle(ctx, { color: '#444', width: 1})
        let zps = this.zoom.zoomPoints

        this.points.forEach((p, i)=>{
            // zps[i].pen.line(ctx, p, '#222')

        })

        this.points.forEach((p, i)=>{
            zps[i].pen.fill(ctx, p.color)
        })

        // zps.pen.fill(ctx, { color: , width: 1})
        this.origin?.pen.circle(ctx, 5, 'red')
        // let v = this.dis.closest(mousePoint)
        let v = this.dis.near(mousePoint, 200)

        for(const p of v){
            // p.pen.fill(ctx, { color: 'green', width: 3})
        }
        // console.log(v.length)
    }
}

stage = MainStage.go()
