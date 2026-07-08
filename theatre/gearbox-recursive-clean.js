/*
title: Recursive Gearbox Clean
src_dir: ../point_src/
categories: gears
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

        let ps = new PointList(
            new Point({x:350, y:200, radius: 150}),
            new Point({x:700, y:200, radius: 75}),

            new Point({x:600, y:400, radius: 100}),
            new Point({x:600, y:100, radius: 20}),

            new Point({x:659, y:500, radius: 120}),
            new Point({x:150, y:450, radius: 20}),

            new Point({x:180, y:150, radius: 140}),
            new Point({x:180, y:150, radius: 15}),

            new Point({x:100, y:200, radius: 70, motor: 1}),
            new Point({x:800, y:300, radius: 70, motor: -.5})
        )

        ps.each.angularVelocity = 0

        gb.points = ps
        gb.bindPinionWheels(ps[0], ps[1])
        gb.bindPinionWheels(ps[2], ps[3])
        gb.bindPinionWheels(ps[4], ps[5])
        gb.bindPinionWheels(ps[6], ps[7])

        return ps
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