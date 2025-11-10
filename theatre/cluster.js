/*
title: Cluster
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
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    dragging
    ../point_src/table.js
    ../point_src/cluster.js
    stroke
    mouse
 */


let keys = [
    "minDistance"
    , "attractionStrength"
    , "repulsionStrength"
    , "damping"
    , "minVelocity"
    , "maxVelocity"
    , "itercount"
    , "method"
]

const confTable = new Table(keys, {
      'default': [30,  0.004, 200, 0.60,  0.1,  5]
    , 'alt':     [90,  0.002, 100, 0.66,  0.08, 5]
    , 'gas':     [100, 0.001, 800, 0.974, 0.1,  9,  1]
    , 'stable':  [100, 0.001, 80,  0.974, 0.01, 9,  1]
    , 'blob':    [90,  0.002, 100, 0.95,  0.1,  20, 1, 'springy']
    , 'orbitals':[400, 0.01, 90, 0.99,  0.08, 5,  1]
    , 'orbitab': [200, 0.01, 300, 0.98,  0.08, 5,  1]
})

const selectedConfigName =  'stable' // 'default' // "orbitab" // "blob" // "gas" // 'alt'
var settings = confTable.get(selectedConfigName)

var points = PointList.generate.random(50, 500);
points.forEach(p => {
    p.vx = 0
    p.vy = 0
    p.radius = 5
})


// var pointsB = PointList.generate.random(50, 500);
// pointsB.forEach(p => {
//     p.vx = 0
//     p.vy = 0
//     p.radius = 5
// })



addControl('type', {
    field: 'select'
    , onchange(ev) {
        let v = ev.currentTarget.value
        console.log('set settings to', v)
        settings =  confTable.get(v)
    }

    , options: confTable.getKeys()
})

class MainStage extends Stage {

    mounted() {
        console.log('mounted')
        // this.settings = settings
        this.pointA = this.center.copy()
        this.pointB = this.center.copy()
        this.dragging.add(this.pointA, this.pointB)
    }

    draw(ctx) {
        // let settings = this.settings
        let pointA = this.pointA
        let pointB = this.pointB
        let targetPosition = pointB

        let c = settings.itercount
        if(c == undefined) { c = 10 }
        simpleCluster(points, pointA, settings, {
            func: clusterStyleB
            , itercount: c
            // , repulsionStrength: pointA.radius  *2 //+ settings.minDistance
            // , minDistance: pointA.radius * 2 //+ settings.minDistance
        });

        // simpleCluster(pointsB, targetPosition, {
                // method: gravitateSquareDistance
                // method: clusterStyleB
                // method: clusterStable
            // })

        // gravitateSquareDistance(pointsB, targetPosition, settings);
        // clusterStyleA(pointsB, targetPosition, settings);
        // clusterStable(pointsB, targetPosition, settings);

        this.clear(ctx)
        this.drawPoints(ctx);

        pointA.pen.indicator(ctx, {color:'red'})
        // pointB.pen.indicator(ctx, {color:'red'})

        // pointsB.pen.indicators(ctx, {color:'#33aa99'})
        // pointsB.centerOfMass().pen.indicator(ctx, {color: 'pink'})
        points.centerOfMass().pen.indicator(ctx, {color: '#DDD'})
    }

    drawPoints(ctx) {
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'green';
            ctx.fill();
        }

    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
// stage.go()
