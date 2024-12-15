/*
title: double Bind XY
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
    ../point_src/protractor.js
---

Bind the XY of two points, ensuring movement (such as _dragging_) of one entity,
affects the other.
*/


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.bindMap = new XYBindMap()

        let r = this.generate()
        this.points = r
        this.dragging.add(...r)
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
    }

    generate(pointCount=2){

        let ps = new PointList(
            new Point({x:100, y:200, radius: 150}),
            new Point({x:700, y:200, radius: 25}),

            new Point({x:600, y:400, radius: 100}),
            new Point({x:600, y:100, radius: 20}),

            new Point({x:659, y:500, radius: 120}),
            new Point({x:150, y:450, radius: 20}),

            // new Point({x:180, y:150, radius: 140}),
            // new Point({x:180, y:150, radius: 15}),

            // new Point({x:100, y:200, radius: 70}),
            // new Point({x:800, y:300, radius: 70})
        )

        this.bindMap.connect(ps[0], ps[1], { speed: .1 })
        this.bindMap.connect(ps[2], ps[3], { distance: 40, angle: 1})
        this.bindMap.connect(ps[4], ps[5])
        // this.bindMap.connect(ps[6], ps[7])

        return ps
    }

    onEmptyDown(ev) {
        // console.log('onEmptyDown')
        const p = Point
                    .from(ev)
                    .update({
                        radius: 60
                        , angularVelocity: 1
                    })
                    ;
        this.points.push(p)
        this.dragging.add(p)
    }

    draw(ctx){
        this.clear(ctx)

        /* To ensure the bindmap correctly updated, call when required.*/
        this.bindMap.step()

        this.points.pen.indicators(ctx)

        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

}

stage = MainStage.go()