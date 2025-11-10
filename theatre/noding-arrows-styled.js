/*
title: Node Titles with Styled Arrows
files:
    head
    point
    pointlist
    stage
    ../point_src/text/beta.js
    ../point_src/random.js
    dragging
    stroke
    mouse
---

Automatically apply a alpha label, given the position within a list of points.
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.stroke = new Stroke({
            color: '#4466AA'
            , width: 5
        })

        let pts = PointList.generate.random(5, [600, 600], {x:100, y:100})
        pts.each.radius = 15
        pts.each.rotation = 0

        this.points = pts
        this.dragging.add(...pts)
    }

    firstDraw(ctx) {
        ctx.font = '400 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        this.stroke.set(ctx)
    }

    draw(ctx){
        this.clear(ctx)
        let lineColor = this.stroke.settings.color
        let lineWidth = this.stroke.settings.width
        let padding = 10
        let st = this.stroke
        let pts = this.points

        pts.pen.fill(ctx, '#000000AA')
        pts.pen.stroke(ctx)

        pts.forEach((p, i, a)=>{
            let t = String.fromCharCode(97 + i)

            let next = a[i+1]

            ctx.fillStyle = lineColor
            ctx.strokeWidth = 3
            if(next) {
                next.lookAt(p)
                p.lookAt(next)
                let pfrom = p.project(p.radius)
                let pto = next.project(next.radius + padding + 15)
                pfrom.pen.line(ctx, pto, lineColor, lineWidth)

                let rot = pto.directionTo(next)
                pto.pen.ngon(ctx, 3, 5, true, lineColor, 2, rot)

                ctx.fill()
            }

            // ctx.fillStyle = '#DDD'
            // p.text.fill(ctx, t.toUpperCase())
        })

    }
}

stage = MainStage.go()
