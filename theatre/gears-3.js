/*
title: Gears (Internal Wheel)
src_dir: ../point_src/
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
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
---

A simple example of gear-like rotations
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        let r = this.generate()

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
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

}

stage = MainStage.go()