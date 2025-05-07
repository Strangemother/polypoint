/*
categories: split
files:
    ../point_src/math.js
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
 */
class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.gWidth = 50
        this.point = new Point(100, 100, this.gWidth, 0)
        this.count = 20

        this.dragging.add(this.point)//, ...lpoints, ...lpoints2, ...lpoints3, ...lpoints4)
    }

    draw(ctx){
        this.clear(ctx)
        this.gWidth = this.point.radius
        this.point.radians += .01
        this.point.pen.circle(ctx)

        let p = this.point.copy()

        let count = 7;
        let cp = p.copy()
        for (var i = 1; i < count; i++) {
            let ip = cp.copy()
            ip.x += this.gWidth * 3
            let ps = ip.split(i)//.pen.indicators(ctx)
            ps.each.radius = 5
            ip.pen.indicator(ctx, { color: '#444'})
            ps.pen.indicators(ctx)
            cp = ip
        }

        let innerSpinner = -this.point.radians

        /* reset the origin */
        p = p.copy()
        p.y += this.gWidth * 3
        p.x = this.gWidth * 2

        cp = p.copy()
        for (var i = 1; i < count; i++) {
            let ip = cp.copy()
            ip.x += this.gWidth * 3
            let ps = ip.split(i, innerSpinner)//.pen.indicators(ctx)
            ps.each.radius = 10
            ip.pen.indicator(ctx, { color: '#444'})
            ps.pen.indicators(ctx)
            cp = ip
        }

        // this.line.render(ctx)
        // this.line.split(this.count, 90).pen.indicators(ctx)

        // this.line2.splitInner(this.count, 90).pen.indicators(ctx, {color:'green'})
        // this.line2.render(ctx, {color: 'green'})

        // this.curve.render(ctx, {color: 'green'})
        // this.curve.splitInner(this.count, degToRad(0)).pen.indicators(ctx)

        // this.curve2.render(ctx, {color: 'red'})
        // this.curve2.split(this.count,  0, ctx).pen.indicators(ctx)

    }
}


;stage = MainStage.go();