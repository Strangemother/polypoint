/*
title: Double Bind XY
category: binding
src_dir: ../point_src/
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    xybind
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
        // this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
    }

    generate(pointCount=2){

        let ps = new PointList(
            new Point({x:100, y:200, radius: 60}),
            new Point({radius: 10}),

            new Point({x:100, y:400, radius: 60}),
            new Point({radius: 10}),

            new Point({x:300, y:200, radius: 60}),
            new Point({radius: 10}),

            new Point({x:300, y:400, radius: 60}),
            new Point({radius: 10}),

            new Point({x:500, y:200, radius: 60}),
            new Point({radius: 10}),

            new Point({x:500, y:400, radius: 60}),
            new Point({radius: 10})
        )

        // this.bindMap.connect(ps[0], ps[1], { speed: .1 })
        // this.bindMap.connect(ps[2], ps[3] /*, { speed: 1 }*/)
        // this.bindMap.connect(ps[4], ps[5], { distance: 100, angle: 0})
        // this.bindMap.connect(ps[6], ps[7], { distance: 100, angle: 0, relative: false})
        // this.bindMap.connect(ps[8], ps[9], { distance: 100, angle: 2, movable: true})
        // this.bindMap.connect(ps[10], ps[11], { distance: 100, angle: 2, relative: false, movable: true})
        ps[0].xyBindChild(ps[1], { speed: .1 })
        ps[2].xyBindChild(ps[3] /*, { speed: 1 }*/)

        ps[4].xyBind.settings = { distance: 100, angle: 0}
        ps[4].xyBindChild(ps[5])

        // ps[4].xyBindChild(ps[5], { distance: 100, angle: 0})
        ps[6].xyBindChild(ps[7], { distance: 100, angle: 0, relative: false})
        ps[8].xyBindChild(ps[9], { distance: 100, angle: 2, movable: true})
        ps[10].xyBindChild(ps[11], { distance: 100, angle: 2, relative: false, movable: true})

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

    simpleRotate(){

        this.points[4].rotation += 1;
        this.points[6].rotation += 1;

        this.points[8].rotation += 1;
        this.points[10].rotation += 1;

        this.points[5]._updateRequired = true;
        this.points[7]._updateRequired = true;

        this.points[9]._updateRequired = true;
        this.points[11]._updateRequired = true;

        // this.points[3]._bindingSettings.angle += degToRad(1);
        // this.points[5]._bindingSettings.angle += degToRad(1);
    }

    draw(ctx){
        this.clear(ctx)
        this.simpleRotate()
        /* To ensure the bindmap correctly updated, call when required.*/
        this.bindMap.step()
        this.xyBind.step()
        this.points.pen.indicators(ctx)

        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

}

stage = MainStage.go()