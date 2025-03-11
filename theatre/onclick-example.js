/*
files:
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/compass.js
    ../point_src/point.js
    stage
    mouse
---

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        // this.events.wake()
    }

    onClick(ev) {
        this.point.copy(Point.from(ev))
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.fill(ctx, '#880000')
    }
}

stage = MainStage.go(/*{ loop: true }*/)

