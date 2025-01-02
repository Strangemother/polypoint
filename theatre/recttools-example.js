/*
---
title: RectTools example
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/split.js
    ../point_src/jiggle.js
    ../point_src/random.js
    ../point_src/recttools.js
    ../point_src/curve-extras.js
---
*/

const rt = new RectTools(20, 20, 200, 200)
// the overspill radius * .5


class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50, rotation: 0})
        let b = this.b = new Point({x:300,y:200, radius: 50, rotation: 0})
        this.dragging.add(a, b)
        this.events.wake()

        const box = new PointList(
                  new Point(150, 150)
                , new Point(500, 400)
            )

        this.lines = twoPointBox(...box)

        this.rectTools = new RectTools(
                                    box[0].x, box[0].y
                                    , box[1].x, box[1].y
                                )
        // testRect()
    }

    onClick(){

    }

    draw(ctx){
        this.clear(ctx)
        // this.a.rotation += .5
        let a = this.a
        let color = 'hsl(100deg, 50%, 20%)'
        if( this.rectTools.containsPoint(a) ){
            color = 'hsl(200deg, 100%, 60%)'
        }
        a.pen.fill(ctx, color)

        let b = this.b
        color = 'hsl(100deg, 50%, 20%)'
        if( this.rectTools.touchingPoint(b) ){
        // if( this.rectTools.hasPoint(b) ){
            color = 'hsl(200deg, 100%, 60%)'
        }
        b.pen.fill(ctx, color)

        this.lines.forEach(l=>l.render(ctx, {color: 'red'}))
    }
}


;stage = MainStage.go();