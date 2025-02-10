/*

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
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/tangents.js

 */

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
        this.doLines()
        // this.dragging.add(...this.randomPoints)
        this.dragging.addPoints(...this.points)//, ...this.la, ...this.lb)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
        this.dragging.onWheel = this.onWheel.bind(this)
    }

    generate(pointCount=3){
        /* Generate a list. In this random... */
        this.points = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        this.points.forEach(p => {
                // p.rotation = Math.random() * 360
                p.radius = Math.max(5, 20)
            })
    }

    doLines() {
        // let lines = calculateAdjustedRotatedTangentLines(...this.points)
        let a = this.points[0]
        let b = this.points[1]
        let c = this.points[2]

        this.lines = [
             this.asPointList(a.tangent.outerLines(b))
            , this.asPointList(b.tangent.outerLines(c))
            , this.asPointList(c.tangent.outerLines(a))
        ]

    }

    asPointList(tLines) {

        return [new PointList(
            new Point(tLines.a[0])
            , new Point(tLines.a[1])
        )
        , new PointList(
            new Point(tLines.b[0])
            , new Point(tLines.b[1])
        )]
    }

    onDragEnd(){
        this.doLines()
    }

    onDragMove(){
        this.doLines()
    }

    onWheel(ev, p) {
        this.doLines()
    }

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)
        this.dragging.getPoint()?.pen.circle(ctx)
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        ctx.strokeStyle = '#555'
        ctx.lineWidth = 2
        this.points.pen.stroke(ctx)
        // this.others.pen.indicators(ctx, this.rawPointConf)

        for(let pointlistPair of this.lines) {
            ctx.strokeStyle = 'green'
            ctx.lineWidth = 2
            pointlistPair[1].pen.line(ctx)
            // pointlistPair[1].pen.indicators(ctx, this.rawPointConf)

            ctx.strokeStyle = '#880000'
            ctx.lineWidth = 2
            pointlistPair[0].pen.line(ctx)
            pointlistPair.forEach((pl)=>{
                // pl.pen.indicators(ctx, this.rawPointConf)
                pl.pen.fill(ctx, '#000')
            })
        }
    }

}

stage = MainStage.go()