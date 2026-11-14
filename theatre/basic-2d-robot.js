/*
title: Basic 2D Robot
files:
    head
    point
    pointlist
    mouse
    stage
    dragging
    ../point_src/random.js
    ../point_src/split.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/keyboard.js
    ../point_src/stage-clock.js
    stroke
---

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
      
        // our little robot's body top down.
        this.body = new Point(200, 200, 25)
        this.wheelSpacing = this.body.radius * 2
        this.wheels = this.body.split(2, Math.PI, Math.PI/2)
        this.wheels.each.radians = (this.body.radians + Math.PI)
        this.wheels.each.radius = this.body.radius
        this.body.radius = 20
        this.wheels[0].speed = 0
        this.wheels[1].speed = 0
        this.wheels[0].dashOffset = 0
        this.wheels[1].dashOffset = 0

        // power addition for the wheels
        this._speedA = 0
        this._speedB = 0
        this.keyDown = {}

        this._tick = 0 
        this.dragging.add(this.body)
        this.keyboard.wake()
    }

    step() {
        /* run the bot. In this first example, the bot only has 
        functioning 2 wheels, buggy style [-1, 0, 1]. 
        Use a differential drive algorithm to control the wheels
        */
       this._tick++;
       // for now demo.
    //    this.wheels[0].speed = .01 + Math.cos(this._tick * .005) * 2
    //    this.wheels[1].speed = .02 + Math.sin(this._tick * .006) * 2

        this.moveRobot()
    }

    onKeydown(ev) {
        // console.log(ev)
        let key = ev.key
        this.keyDown[key] = true
        // console.log(this.keyDown)
    }

    onKeyup(ev) {
        let key = ev.key
        this.keyDown[key] = false
        // console.log('keyup', key)
    
    }

    updateWheelSpeeds() {

        let maxSpeed = 5
        let pushSpeed = .05
        let torque = 2
        let friction = .994

        // update wheel speeds based on user input
        if(this.keyDown['ArrowUp'] == true) {
            this._speedA += (pushSpeed * .5) * torque
            this._speedB += (pushSpeed * .5) * torque
        }
        
        if(this.keyDown['ArrowDown'] == true) {
            this._speedA += pushSpeed * -1.1 * torque
            this._speedB += pushSpeed * -1.1 * torque
        }
        
        if(this.keyDown['ArrowLeft'] == true){
            this._speedA += (pushSpeed * .5) * torque
        }
        
        if(this.keyDown['ArrowRight'] == true) {
            this._speedB += (pushSpeed * .5) * torque
        }
        
        // friction
        this._speedA *= friction
        this._speedB *= friction

        // clamp 
        this._speedA = clamp(this._speedA, -maxSpeed, maxSpeed)
        this._speedB = clamp(this._speedB, -maxSpeed, maxSpeed)

        // apply user input to wheel speeds
        this.wheels[0].speed = this._speedA
        this.wheels[1].speed = this._speedB

    }

    moveRobot() {
        this.updateWheelSpeeds()
        // Signed wheel travel in pixels per step; wheel 0 is on the right.
        let [right, left] = this.wheels
        // Wheel rotation advances the tread by the distance each wheel travels.
        right.dashOffset -= (right.speed * .8)
        left.dashOffset -= (left.speed * .8)
        let distance = (left.speed + right.speed) / 2
        let turn = (left.speed - right.speed) / this.wheelSpacing
        let halfTurn = turn / 2
        let heading = this.body.radians
        // Integrate the circular arc, including the straight-line limit.
        let travel = distance * (halfTurn === 0 ? 1 : Math.sin(halfTurn) / halfTurn)

        this.body.x += travel * Math.cos(heading + halfTurn)
        this.body.y += travel * Math.sin(heading + halfTurn)
        this.body.radians = heading + turn

        let sideX = -Math.sin(this.body.radians) * this.wheelSpacing / 2
        let sideY = Math.cos(this.body.radians) * this.wheelSpacing / 2
        right.x = this.body.x + sideX
        right.y = this.body.y + sideY
        left.x = this.body.x - sideX
        left.y = this.body.y - sideY
        this.wheels.each.radians = this.body.radians + Math.PI
    }

    draw(ctx){
        this.clear(ctx)
        this.step()

        let p = this.body
        p.pen.indicator(ctx, {color: '#336600'})
        
        ctx.save()
        ctx.setLineDash([5, 10])
        ctx.lineCap = 'round'
        this.wheels.forEach(wheel => {
            ctx.lineDashOffset = wheel.dashOffset
            wheel.project().pen.line(ctx, wheel, '#336600', 4)
            ctx.beginPath()
        })
        ctx.restore()
    }
}



;stage = MainStage.go();