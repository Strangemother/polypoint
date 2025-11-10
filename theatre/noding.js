/*
title: Node Titles with Auto Labels
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
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/stage-clock.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/text/beta.js
    ../point_src/curve-extras.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/within.js
    ../point_src/automouse.js
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
            p.text.fill(ctx, t.toUpperCase())
        })

    }
}

stage = MainStage.go()
