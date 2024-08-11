
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.center.radius = 50

        let radius = 7
        let rowCount = 5 /* How many items per row within the grid */
        let count = 200
        const pointList = PointList.generate.list(count, 0)

        /* To set the position of the grid generator, we can just edit the
        first point. */
        pointList[0].set(50, 50)
        /* Then reshape internally */
        // let pointSpread = 150 /* Distance between points */
        // pointList.shape.grid(pointSpread, rowCount)
        pointList.shape.random(600, rowCount)
        pointList.setMany(radius, 'radius')
        this.points = pointList
        this.dis = new Distances
        this.dis.addPoints(...pointList)
    }

    draw(ctx){
        this.clear(ctx)

        let mousePoint = Point.mouse.position
        this.points.lookAt(mousePoint)
        /* Draw each point; wrapping the _draw_ call_ with our own functionality.*/
        this.points.pen.indicators(ctx, { color: 'gray', width: 1})

        // let v = this.dis.closest(mousePoint)
        let v = this.dis.near(mousePoint, 200)

        for(const p of v){
            p.pen.indicator(ctx, { color: 'green', width: 3})
        }
        // console.log(v.length)
    }
}

stage = MainStage.go()
