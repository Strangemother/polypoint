

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
