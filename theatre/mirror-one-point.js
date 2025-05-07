/*
categories: reflections
files:
    head
    stroke
    pointlist
    point
    mouse
    dragging
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    stage
*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.points = new PointList(
                new Point({x:406, y:76, radius: 20})
                , new Point({x:145, y:397, radius: 20})
            )

        this.dragging.addPoints(...this.points, this.center)

        /* Apply the start and end points of the mirror. */
        this.mirror = new Mirror(this.points)
        /* Add things to reflect in the mirror */
        this.mirror.add(this.center)
    }

    draw(ctx){
        this.clear(ctx)

        /* Must be called at some point to update the mirror points. */
        this.mirror.step();
        /* Draw the optional contents of the mirror */
        this.mirror.draw(ctx);

        this.center.pen.indicator(ctx, {color:'green'})

        this.dragging.drawIris(ctx)
    }
}


;stage = MainStage.go();