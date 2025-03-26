/*
title: Chord Rect
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/chords.js
---

*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point({x: 250, y: 150 , radius: 20, rotation: 45})
        this.topLeft = new Point({x: 20, y: 40 , radius: 10})
        this.bottomRight = new Point({x: 500, y: 300 , radius: 10})

        this.dragging.add(this.point, this.topLeft, this.bottomRight)
    }

    onMousedown(ev) {
        this.point.rotation = random.int(180)
    }

    draw(ctx){
        this.clear(ctx)
        let p = this.point
        let tl = this.topLeft
        tl.pen.indicator(ctx)
        let br = this.bottomRight
        br.pen.indicator(ctx)

        let ps = rectChordEndpoints(this.topLeft, this.bottomRight, p)//, p.radians)

        ps = PointList.from(ps).cast()
        // let ps = rectChordEndpoints(20, 500, 40, 300, p[0], p[1], p.radians)
        ps.pen.fill(ctx, {color: 'purple'})
        // ps.forEach(p=> (new Point(p)).pen.fill(ctx, {color: 'purple'}))
        ps[0]?.pen.line(ctx, ps[1], 'purple')
        this.point.pen.indicator(ctx)

    }
}


console.log('chord');


stage = MainStage.go(/*{ loop: true }*/)
