/*
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js


 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                name: "up"
                , rotation: UP_DEG
                , x: 50, y: 50
            })
            , new Point({
                name: "right"
                , rotation: RIGHT_DEG
                , x: 100, y: 50
            })
            , new Point({
                name: "down"
                , rotation: DOWN_DEG
                , x: 150, y: 50
            })
            , new Point({
                name: "left"
                , rotation: LEFT_DEG
                , x: 200, y: 50
            })
            , new Point({
                name: "spinner"
                , x: 250, y: 50
            })
        )
    }

    draw(ctx){
        this.clear(ctx)
        this.points.last().rotation += 2
        for(let p in this.points) {
            this.points[p].pen.indicator(ctx)
        }
    }
}

stage = MainStage.go(/*{ loop: true }*/)
