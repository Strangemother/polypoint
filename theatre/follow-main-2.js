
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 250, y: 150
                , radius: 10
                , vx: 1, vy: 0
                , mass: 2
            })
            , new Point({
                 x: 400, y: 320
                , vx: -1, vy: 0
                , radius: 10
                , mass: 10
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
        )
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position
        // followPoint(mouse, this.points[0], 50)
        // followPoint(this.points[1], this.points[2], 50)
        // followPoint(this.points[2], this.points[3], 50)
        // followPoint(this.points[3], this.points[4], 50)
        // followPoint(this.points[4], this.points[5], 50)

        this.points[0].track(mouse, 100)
        this.points[1].track(this.points[0], 50)
        this.points[2].track(this.points[1], 50)
        this.points[3].track(this.points[2], 50)
        this.points[4].track(this.points[3], 50)
        this.points[5].track(this.points[4], 50)

        // this.points.last().rotation += 2
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
