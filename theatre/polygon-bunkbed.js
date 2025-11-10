/*
title: Polygon Point-in-Polygon Test
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/stagepen.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/curve-extras.js
    ../point_src/random.js
    dragging
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/rotate.js
    ../point_src/functions/within.js
    ../point_src/automouse.js

---

Click to draw connected lines (filling a `PointList`)
Then check the mouse is within the drawn _polygon_ using the `withinPolygon` function
 */

addButton('Toggle Line', {
    onclick() {
        stage.drawLine = !stage.drawLine
    }
})


addButton('Toggle Fill', {
    onclick() {
        stage.fillPolygon = !stage.fillPolygon
    }
})


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.drawn = []
        // this.events.wake()

        this.stroke = new Stroke({
            color: '#b32bb6'
            , width: 2
            , dash: [7, 4]
        })

        this.fillPolygon = true
        this.drawLine = false
        this.line = new PointList
        this.dragging.wake()

        this.projectionPoint = this.center.copy()
        this.projectionLength = 500
        this.perspectiveCenter = this.center.copy()
        this.perspectiveCenter.y += 200

        let PI = Math.PI;
        this.spin = {
            x: 90
            , y:  0
            , z: -0
        }
    }

    onEmptyDown(ev) {
    // onClick(ev, point) {
        // if(point == undefined) {
        console.log('Down')
        let np = Point.from(ev)
        this.line.push(np)
        this.dragging.add(np)
        // }
    }

    draw(ctx){
        this.clear(ctx)

        this.stroke.set(ctx)

        let l = this.line;
        if(l) {
            let f = l.first()
            f && f.pen.circle(ctx)
            l.draw.line(ctx)
        }

        if(this.fillPolygon) {
            this.pen.fill(ctx, '#621763')
        }

        if(l){

            this.renderLine(ctx, l)

            let cl = l.copy(true)
            cl.update({z: 100})
            cl.offset({x: 10, y: 10})

            let spin = this.spin

            let spunPoints = cl.pseudo3d.perspective(
                  this.spin
                , this.projectionPoint
                , this.projectionLength
                , this.perspectiveCenter
            )

            this.renderLine(ctx, spunPoints)

        }

        this.stroke.unset(ctx)

    }

    renderLine(ctx, l){

        l.pen.line(ctx, '#b32bb6')
        l[0] && l[0].pen.line(ctx, l.last(), '#b32bb6')

        l.pen.line(ctx, '#555')
        l.pen.circle(ctx)
    }
}

stage = MainStage.go()
