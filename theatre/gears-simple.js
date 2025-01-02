/*
title: Gears (Nearly)
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
        this.dragging.add(...this.randomPoints)
    }

    generate(pointCount=2){
        this.randomPoints = new PointList(
           new Point({x:300, y:200, radius: 70, motor: true, angularVelocity: 1}),
           new Point({x:500, y:200, radius: 150, angularVelocity: 0}),
           new Point({x:700, y:200, radius: 70, angularVelocity: 0}),
           new Point({x:800, y:300, radius: 70, angularVelocity: 0}),
        )
    }

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)

        let ps = this.randomPoints

        ps.forEach(p=> {
            if(isMotor(p)) {
                p.rotation += p.motor
            }
        })

        let prev = ps[0]

        for (let i = 1; i < ps.length; i++) {
            let p = ps[i]
            let distance = prev.distanceTo(p) - p.radius
            if(distance < prev.radius) {
                let ip = prev.copy().update({radius:distance})
                ip.pen.circle(ctx, {color:'#444'})
            }

            if(pointToPointContact(prev, p)) {
                let chained = cv(prev, p)
                prev = p
            }
        }

        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        let style = { color: "#333", line: {color: 'white'}}
        this.randomPoints.forEach((p)=> {
            p.split(~~(p.radius/5)).pen.indicators(ctx, style)
        })

        this.randomPoints.pen.indicators(ctx, this.rawPointConf)
        // this.others.pen.indicators(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()