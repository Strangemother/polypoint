/*
category: events
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(300, 300, 20)
        this.events.wake()
    }

    onClick(ev) {
        this.clickPoint = Point.from(ev)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.circle(ctx, {color:'#eee'})
        this.clickPoint && this.clickPoint.pen.fill(ctx, '#880000')
    }
}

stage = MainStage.go(/*{ loop: true }*/)
