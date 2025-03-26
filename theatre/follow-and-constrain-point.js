/*
title: Point Follow And Constrain
files:
    ../point_src/core/head.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    point
    stage
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/constrain-distance-locked.js
    ../point_src/constrain-distance.js
---

Follow the mouse position with `track`, `avoid`, and `leash`

*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.size = 150
        this.orbitPoint = new Point({
             x: 250, y: 150
            , radius: 10
        })

        this.innerPoint = new Point({
            radius: 20
        })

        this.orbitPet = new Point()

        this.outerPoint = new Point({
             x: 400, y: 320
             , radius: 20
        })
    }

    draw(ctx){
        this.clear(ctx)
        ctx.fillStyle = 'green'
        ctx.strokeStyle = 'yellow'

        let mouse = Point.mouse
        let mp = mouse.position

        let size = mouse.clampWheelSize(5, 20)
        let r = size * size
        mp.radius = r

        this.orbitPoint.track(mp, r)
        this.orbitPet.track(this.orbitPoint, 50)
        this.outerPoint.avoid(mp, r + this.outerPoint.radius)
        this.innerPoint.leash(mp, r - this.innerPoint.radius)

        mp.pen.circle(ctx)

        this.orbitPoint.pen.fill(ctx)
        this.innerPoint.pen.circle(ctx)
        this.orbitPet.pen.circle(ctx)
        this.outerPoint.pen.fill(ctx)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
