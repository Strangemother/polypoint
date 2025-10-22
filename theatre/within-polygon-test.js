/*
title: Polgon hit-test
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

        if(l && this.drawLine){
            l.pen.line(ctx, '#b32bb6')
            l[0].pen.line(ctx, l.last(), '#b32bb6')
        }

        /* Start texting if we have enough points.*/
        if(l?.length > 2) {
            let within = withinPolygon(this.mouse.point, l)
            if(within) {
                this.mouse.point.pen.fill(ctx, this.fillPolygon? 'purple': 'orange')
            }
        } else {
            if(l && (!this.drawLine)){
                l.pen.line(ctx, '#555')
            }
        }

        l.pen.circle(ctx)
        this.stroke.unset(ctx)

    }
}

stage = MainStage.go()
