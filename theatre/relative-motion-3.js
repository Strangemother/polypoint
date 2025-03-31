/*
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
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/keyboard.js
    ../point_src/relative.js
    ../point_src/functions/clamp.js

*/

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 200, y: 200, vx: 0, vy: 0})
        this.events.click(this.mouseClick.bind(this))
        this.clickPoint = new Point(0,0)

        this.keyboard.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        this.keyboard.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        this.keyboard.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        this.keyboard.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))

        this.a.update({radius: 10})
        this.rotationSpeed = 0
        this.speed = 0
    }

    onUpKeydown(ev) {
        // this.a.relative.forward(20)
        this.speed = .2 + (this.speed * 1.02)
    }

    onDownKeydown(ev) {
        this.speed = -.2 + (this.speed * .98)
        // this.speed -= 1
        // this.a.relative.backward(20)
        // this.a.relative.forward(-20)
    }

    onLeftKeydown(ev) {
        if(ev.shiftKey || ev.ctrlKey) {
            this.a.relative.left(10)
            return
        }

        this.rotationSpeed -= .2
    }

    onRightKeydown(ev) {
        if(ev.shiftKey || ev.ctrlKey) {
            this.a.relative.right(10)
            return
        }
        this.rotationSpeed += .2
    }

    mouseClick(ev) {
        this.clickPoint = new Point(ev.x, ev.y)
        this.a.target = this.clickPoint
    }

    draw(ctx) {
        this.clear(ctx)
        this.a.rotation += this.rotationSpeed
        this.rotationSpeed *= .98
        this.a.relative.forward(this.speed)
        // this.a.relative.move({x: 1, y: 0}, 0, 4)
        // this.a.relative.towards(this.clickPoint)
        this.a.pen.indicator(ctx)
        this.clickPoint.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
