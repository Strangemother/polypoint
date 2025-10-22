/*
title: Titles on "Nodes"
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
            color: '#33aaFF'
            , width: 3
            , dash: [5, 5]
            , march: .1
        })

        let pts = PointList.generate.random(5, [600, 400], {x:100, y:100})
        pts.each.radius = 40
        pts.each.rotation = 0

        this.points = pts
        this.dragging.add(...pts)
    }

    draw(ctx){
        this.clear(ctx)
        let lineColor = '#990000'
        let padding = 15
        // let lineColor = 'purple'
        let st = this.stroke
        let pts = this.points

        st.step()
        st.wrap(ctx, ()=>{
            pts.pen.stroke(ctx)
            pts.pen.fill(ctx, '#000000AA')
        })

        ctx.fillStyle = '#DDD'
        ctx.font = '400 22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        pts.forEach(function(p, i, a){
            let t = String.fromCharCode(97 + i)
            ctx.fillStyle = '#DDD'
            p.text.fill(ctx, t.toUpperCase())
            let next = a[i+1]
            if(next) {
                next.lookAt(p)
                p.lookAt(next)
                let pfrom = p.project(p.radius + padding)
                let pto = next.project(next.radius + padding + 10)
                pfrom.pen.line(ctx, pto, lineColor, 2)

                // pto.pen.fill(ctx, lineColor, 10)
                let rot = pto.directionTo(next)
                pto.pen.ngon(ctx, 3, 5, true, lineColor, 2, rot)
                ctx.fillStyle = '#880000'
                ctx.fill()
            }
        })

    }
}

stage = MainStage.go()
