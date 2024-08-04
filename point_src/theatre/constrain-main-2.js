
const constrainDistance = function(pointA, pointB, maxDistance) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is greater than the maxDistance, move pointB closer
    if (distance > maxDistance) {
        const ratio = maxDistance / distance;
        const constrainedX = pointA.x - dx * ratio;
        const constrainedY = pointA.y - dy * ratio;
        pointB.x = constrainedX;
        pointB.y = constrainedY;
    }
    // If the distance is less than or equal to the maxDistance, pointB stays in place
}

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
        constrainDistance(mouse, this.points[0], 50)
        constrainDistance(this.points[0], this.points[1], 50)
        constrainDistance(this.points[1], this.points[2], 50)
        constrainDistance(this.points[2], this.points[3], 50)
        constrainDistance(this.points[3], this.points[4], 50)
        constrainDistance(this.points[4], this.points[5], 50)
        // this.points.last().rotation += 2
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
