/*
category: center
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js


 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50
    }

    draw(ctx){
        this.clear(ctx)

        let c = this.center
        c.lookAt(Point.mouse.position)
        c.pen.indicator(ctx, {color:'green'})
    }
}

stage = MainStage.go()

