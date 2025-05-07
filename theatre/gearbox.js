/*
title: Gears (Internal Wheel)
src_dir: ../point_src/
categories: gears
files:
    head
    point
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    stage
    dragging
    pointlist
    mouse
    stroke
    ../point_src/split.js
    ../point_src/stage-clock.js
    ../point_src/touching.js
    ../point_src/coupling.js
    ../point_src/xybind.js
    ../point_src/gearbox.js
    ../point_src/json.js
---

A simple example of gear-like rotations
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        let r = this.generate()

        let p = new Point(400, 400, 140)
        p.rachet = -1
        let pin = p.copy().update({
            radius: p.radius * .5
            , ratchet: -1
        })
        // let pin2 = p.copy().update({ radius: p.radius * .3 })
        this.p1 = p
        this.pin1 = pin
        this.gearBox.addGear(p)
        this.gearBox.addGear(pin)
        // this.gearBox.addGear(pin2)
        this.gearBox.bindPinionWheels(p, pin)
        this.dragging.add(p, pin)

        this.dragging.add(...r)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
    }

    generate(pointCount=2){
        let gb = this.gearBox = new GearBox()
        gb.createMotor({x:100, y:300, radius: 30})
        gb.createGear({x:100, y:200, radius: 100})
        gb.createReductionGear({x:200, y:200, radius: 100})
        gb.createReductionGear({x:300, y:200, radius: 100})
        gb.createReductionGear({x:400, y:200, radius: 100})
        gb.createInternalGear({x:400, y:300, radius: 60})
        gb.createInternalGear({x:400, y:300, radius: 60})
        return gb.points
    }


    onEmptyDown(ev) {
        // console.log('onEmptyDown')
        const p = Point.from(ev).update({
                    radius: 60
                    , angularVelocity: 1
                })
        this.gearBox.addGear(p)
        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)

        this.gearBox.performDraw(ctx)
        ctx.fillStyle = 'white'


        this.gearBox.points.forEach((p)=>{
            let radtodeg = (p.angularVelocity / 360
                        * 60 /*fps */
                        // * 60 /* seconds */
                        )
            p.text.string(ctx, radtodeg.toFixed(2))
        })

        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }

    }

}


stage = MainStage.go();
