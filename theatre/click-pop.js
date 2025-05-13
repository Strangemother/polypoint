/*
title: Click Pop
category: emitter
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
    ../point_src/text/beta.js
    ../point_src/text/alpha.js
    ../point_src/stage-clock.js
    ../point_src/text/fps.js
---

*/



class ClickPumpRandomPointEmitter extends PumpRandomPointEmitter {
    /* Only execute when _clicked_. This is acheived by turning
    off the modulo tick (tickModulo=0)
    and running _cycle_ when required.

        let e3 = new ClickPumpRandomPointEmitter(500,200, 60)
        e3.wake()

        draw(){
            e3.step()  // Always run
        }

        onclick(){
            e3.cycle()
        }

    One cycle will emit a count of _birthrate_ - to the age of `lifetime`
    */
    tickModulo = 0
    pointLimit = 200
    birthrate = 100
    // birthrate = 100
    lifetime = 100
}



class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        // this.point = new Point(100, 100, 20)
        /*this.point.onMousedown = (e)=>{
            console.log("onClick", e)
            this.blast()
        }*/

        // this.events.wake()

        // let e2 = new PumpRandomPointEmitter(400,400, 60)
        // // let e2 = new RandomPointEmitter(400,400, 60)
        // e2.direction = {x:-1, y:0} //inward.
        // e2.fromEdge = true
        // e2.tickModulo = 10
        // e2.speed = 1
        // e2.birthrate = 3
        // e2.lifetime = e2.radius * .5
        // e2.wake()
        // this.e2 = e2


        // let e3 = new Emitter(500,200, 60)
        // e3.fromEdge = true
        // e3.tickModulo = 100
        // e3.birthrate = 20
        // e3.lifetime = 200
        let e3 = new ClickPumpRandomPointEmitter(100,200, 30)
        e3.onMousedown = (e)=>{
            console.log("onClick", e)
            this.blast()
        }
        e3.wake()
        e3.lifetime = ()=>Math.random() *  e3.radius
        // e3.speed = 20
        e3.particleSpeed = ()=>1+(Math.random() * 3)
        this.e3 = e3

        this.dragging.add(e3)
        e3.draggable = false
    }

    blast() {
        this.e3.cycle()
        this.e3.xy = [random.int(100, 800), random.int(100, 600)]
    }

    draw(ctx){
        this.clear(ctx)
        let es = [this.e3]
        // let es = [this.e1, this.e2, this.e3]
        this.fps.drawFPS(ctx)

        ctx.fillStyle = '#EEE'
        ctx.strokeStyle = '#EEE'
        ctx.font = `400 16px sans-serif`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        es.forEach(e=>{
            // e.cycle()
            e.step()
            e.rotation += (e.speed || 0)
            // e.lookAt(this.mouse.point)
            e.pen.circle(ctx)
            // e.text.fill(ctx, e.length)

            e.points.forEach(p=>{
                // ctx.beginPath()
                p.pen.fill(ctx)
                // ctx.stroke()
            })
            // e.points.pen.circle(ctx)
        })

        // this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

