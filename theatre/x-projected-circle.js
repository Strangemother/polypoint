/*
src_dir: ../point_src/
title: Experimental: Projected Circle
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
    pointlist
    ../point_src/events.js
    ../point_src/functions/clamp.js
    dragging
    stroke
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/stage-clock.js
    ../point_src/protractor.js
    ../point_src/relative.js
    ../point_src/automouse.js
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let radius = 100

        // let count = 10
        // this.tick = 9


        let count = 4
        this.tick = 9

        this.pointA = this.center.copy().update({ radius})
        this.pointB = this.center.copy().update({radius: 100})
        this.pointA.x -= 150
        this.pointB.x += 150

        this.pointsA = this.pointA.split(4).pairs(0)

        this.pointsB = this.pointB.split(count, degToRad(90)).siblings(1)

        this.curves = []
        this.pointsB.forEach(pl=>{
            pl[0].radius = radius * 1
            pl[1] = pl[1].copy()
            pl[1].lookAt(pl[0])
            let c = new BezierCurve(...pl)
            c.doTips = false

            // c.useCache = false
            this.curves.push(c)
        })

        this.dragging.add(this.pointA, this.pointB, this.pointsA, this.pointsB)
        this.pointsA.forEach( pl => this.dragging.add(...pl))
        this.pointsB.forEach( pl => this.dragging.add(...pl))
    }

    draw(ctx){
        this.clear(ctx)

        // this.pointA.pen.indicator(ctx)
        // this.pointB.pen.indicator(ctx)

        this.pointsA.forEach(pl=>{
            pl.pen.indicators(ctx)
            pl.pen.line(ctx)
        });

        let d = 0// this.tick || this.clock.tick * .04
        let t = this.clock.tick * .04
        this.pointsB.forEach(pl=>{
            pl.forEach((p, i)=>{
                p.rel.rotation = (Math.sin(d) + (Math.cos(d) * .2)) * 30
                p.rel.x = (Math.cos(t) * 3)
                p.rel.y = (Math.sin(t) * 3)
            })
        })

        // this.points.pen.indicators(ctx)

        this.curves.forEach(pl=>{
            pl.render(ctx)
            // pl.getControlPoints().forEach((p)=>p.pen.indicator(ctx))
        })

    }
}

;stage = MainStage.go();
