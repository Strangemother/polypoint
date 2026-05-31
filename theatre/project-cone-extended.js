/*
---
title: Project Cone
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stagepen.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/cone.js
    ../point_src/stage.js
    ../point_src/functions/within.js
    ../point_src/constrain-distance.js
---

The projected cone from the center of the origin. This is actually
a pointlist with a fill.
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({
                            x:200, y:200, 
                            radius: 100,
                            rotation: 10, 
                            coneDeg: 50
                        })

        this.dragging.add(a)

        let coneSettings = this.getDemoConeSettings(a)
        a.cone.update(coneSettings)
    }

    draw(ctx){
        this.clear(ctx)

        this.a.rotation += .2
        // let cone = this.a.cone.renderData()
        this.a.cone.fill(ctx, {color: '#0c0811'})
        // cone.points.pen.line(ctx, {color: 'purple', width: 2, closed: true})
        this.a.pen.indicator(ctx, {color:'#ddd'})

        const mp = this.mouse.point
        if(mp.within.cone(this.a)) {
            mp.radius = 15
            mp.pen.fill(ctx, {color: 'green'})
        } else {
            mp.radius = 5
        }
        this.a.cone.renderOutline(ctx)

    }

    getDemoConeSettings(point) {
        return {
            container: this.dimensions
            /* For a projected distance - Omit for _to walls_ */
            , distance: point.radius * 3
            /* For a projected distance - Including wall intersections */
            , viewportLimit: false
            /* Offset the start anchor by a multiple of the point radius.
            0 starts at center, 1 starts at the point edge. */
            , innerOffset: 1
            /* Project to max radius of the point. - */
            , inner: false

            /* -1-0-1 value of how much curve to apply to the cone fill.
            `curve:-1` is the same as `invertCurve:true` */
            , curve: .3
            , invertCurve: false

            /* Apply the same signed curve control to the inner return edge.
            curve:1 innerCurve:1 produces a donut slice. */
            , innerCurve: true

            // , outline: true
            // , outline: false
            // , outline: 'edge'
            // , outline: 'outer'
            // , outline: { leading: true, trailing: true, inner: false, outer: false }
            , outline: 'outer'
        }
    }
}


;stage = MainStage.go();