/*
categories: relative
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
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage-clock.js


A relative motion of each point witin a random pointlist
*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = this.center.copy().update({radius: 20})

        this.dragging.add(this.point)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
        this.events.wake()
    }

    onEmptyDown(ev) {
        console.log('onEmptyDown')
        this.origin = Point.from(ev)

    }

    onMousemove(ev) {
    }

    onMouseup(ev) {
    }

    step() {
        let speed = 6
        let radius = 100
        let tick = this.clock.tick * (speed * .01)
        this.point.rel.x = Math.sin(tick) * radius
        this.point.rel.y = Math.cos(tick) * radius
    }

    draw(ctx){
        this.step()
        this.clear(ctx)
        let mousePoint = Point.mouse.position
        this.point.lookAt(mousePoint)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.point.pen.indicator(ctx, { color: 'gray', width: 1})

        this.origin?.pen.circle(ctx)
    }
}

stage = MainStage.go()
