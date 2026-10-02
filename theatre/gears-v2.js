/*
title: Simple Gear System
categories: gears
src_dir: ../point_src/
files:
    head
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    ../point_src/split.js
    ../point_src/stage-clock.js
    ../point_src/touching.js

---

A simple example of gear-like rotations
*/


function cv(circleA, circleB) {
  // circleA and circleB each have:
  //   radius: number
  //   angularVelocity: number (radians per second or degrees per second)

  // Angular velocity of B given A:
  circleB.angularVelocity = -(circleA.radius / circleB.radius) * circleA.angularVelocity;
  circleB.rotation += circleB.angularVelocity
}


const isMotor = function(point) {
    let mv = point.motor
    if(mv === undefined || mv === false) {
        return false
    }

    return true
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
        this.dragging.add(...this.items)
    }

    generate(pointCount=2){
        this.items = new PointList(
           new Point({x:300, y:200, radius: 70, angularVelocity: 1}),
           new Point({x:500, y:200, radius: 150, angularVelocity: 0}),
           new Point({x:700, y:200, radius: 70, angularVelocity: 0}),
           new Point({x:800, y:300, radius: 70, angularVelocity: 0}),
        )
    }

    draw(ctx) {
        this.stepView()
        this.clear(ctx)
        this.drawView(ctx)
    }

    stepView() {
        let ps = this.items.getDirty()
        ps.forEach(p => {
            if (p._change == undefined) {
                p._change = 0
                return
            }
            let touching = this.items.getTouching(p)
            touching.forEach(pChild => {
                cv(p, pChild, p._change)
            })
            p.angularVelocity *= .9
        })

        this.items[0].angularVelocity = 1
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        let style = { color: "#333", line: { color: 'white' } }

        this.items.pen.indicators(ctx, this.rawPointConf)
        // this.others.pen.indicators(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()
