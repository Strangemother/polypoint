/*

files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    pointlist
    ../point_src/events.js
    dragging
    ../point_src/table.js
    ../point_src/cluster.js
    stroke
    mouse
 */


var points = PointList.generate.random(100, 500);
points.forEach(p => {
    p.vx = 0
    p.vy = 0
    p.radius = 5
})

class MainStage extends Stage {

    mounted() {
        this.target = this.center.copy()
        this.dragging.add(this.target)
    }

    draw(ctx) {
        this.clear(ctx)
        let target = this.target
        simpleCluster(points, target, {
                func: gravitateSquareDistance // clusterStyleB // clusterStable
                // func: clusterStable
            })

        target.pen.indicator(ctx, {color:'red'})
        points.pen.indicators(ctx, {color:'#33aa99'})
        points.centerOfMass().pen.indicator(ctx, {color: 'pink'})
    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
// stage.go()
