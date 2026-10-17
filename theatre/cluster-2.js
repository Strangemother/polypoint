/*
title: Cluster 2
categories: clusters
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
    ../point_src/velocity.js
    stroke
    mouse
 */


var points = PointList.generate.random(100, 500);
points.forEach(p => {
    p.vx = 0
    p.vy = 0
    p.radius = 5
})


const  randomizeSettings = function(points) {
    points.forEach(p => {
        p.minDistance = 100 + Math.random() * 100
        p.minVelocity = 0.1 + Math.random() * 0.1
        p.maxVelocity = 1 + Math.random() * 1
        p.damping = 0.94 + Math.random() * 0.14
        p.attractionStrength = .01 + Math.random() * .1
        p.repulsionStrength = 23 + Math.random() * 20
    })
}

class MainStage extends Stage {

    mounted() {
        this.target = this.center.copy()
        this.dragging.add(this.target)
        randomizeSettings(points)
    }

    draw(ctx) {
        this.clear(ctx)
        let target = this.target
        simpleCluster(points, target, {
                func: gravitateSquareDistance // clusterStyleB // clusterStable
                // func: clusterStyleB // clusterStable
                // func: clusterStable
                , maxVelocity: 2
                , method: 'springy'
            })
        
        points.forEach(faceVelocity)
        target.pen.indicator(ctx, {color:'red'})
        // points.pen.lines(ctx, 'red', {color:'#33aa99'})
        points.pen.indicators(ctx, {color:'#33aa99'})
        points.centerOfMass().pen.indicator(ctx, {color: 'pink'})
    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
// stage.go()
