/*
title: Will be PaperQuilts logo.
files:
    head
    point
    stage
    mouse
    dragging
    pointlist
    ../point_src/split.js
    ../point_src/json.js
    stroke
---

*/

addButton('point', {
    onclick() {
        stage.aPush(new Point(100, 100))
    }
})


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = this.center.copy().update({radius: 100})
        // this.dragging.add(this.point)

        this.a = new PointList(
                [247,328,5,0]
                ,[383,316,5,0]
                ,[391,239,5,0]
                ,[261,163,5,0]
                ,[117,430,5,0]
                ,[225,657,5,0]
                ,[286,623,5,0]
                ,[227,397,5,0]
            ).cast()
    }

    onClick(ev) {
        this.aPush(Point.from(ev))
    }

    aPush(p) {
        this.a.push(p)
        this.dragging.add(p)
    }
    draw(ctx){
        this.clear(ctx)
        let p = this.point

        // p.pen.indicator(ctx, {color: '#444'})
        this.a.pen.indicator(ctx, {color: 'pink'})
        // this.a.splitInner(10).indicator(ctx, {color: 'pink'})
        this.a.pen.quadCurve(ctx, {color: '#999'})

        // let r = p.radians + (Math.PI/4)
        // p.pen.ngon(ctx, 3, p.radius, 1, '#880000', 2, p.radians)
        // p.pen.box(ctx, p.radius, 'red', 2, r)
        // this.point.pen.box(ctx, this.point.radius, 'red', 2, r)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

