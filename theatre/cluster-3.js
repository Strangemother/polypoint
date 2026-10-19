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

 let keys = [
     "minDistance"
    , "minDistanceRandom"
    , "minVelocity"
    , "minVelocityRandom"
    , "maxVelocity"
    , "maxVelocityRandom"
    , "damping"
    , "dampingRandom"
    , "attractionStrength"
    , "attractionStrengthRandom"
     , "repulsionStrength"
    , "repulsionStrengthRandom"
 ]

 const confTable = new Table(keys, {
     'crowd':     [100, 100, .1 , .1 , 1 , 1 , .94, .14 , .1 , .1 , 23 , 20]
     , 'stable':  [400, 100, .1 , .1 , 1 , 3 , .99, .01 , .01 , .1 , 23 , 20]
     , 'moshPit': [40, 100, 0 , 0 , 1 , 1, .999, .01 , .1 , .1 , 10 , 20]
     , 'alpha':   [100, 10, 0.01, 0.1, 10 , 5, .8, .01 , 1 , .5 , 300 , 20]
     , 'other':   [10, 10, 0.01, 0.1, 1, 1, .9, .01 , 0 , .5 , 20, 20]
     , 'lines':   [10, 10, 1, 0.1, 1, 1, .29, .01 , 20, .5, 30, 20]
     , 'tight':   [300, 10, .001, 0.1, 1, 1, .29, .01 , 20, .5 , 130, 20]
 })


const randomizeSettingsCrowd = function(points) {
    points.forEach(p => {
        p.minDistance = 100 + Math.random() * 100
        p.minVelocity = 0.1 + Math.random() * 0.1
        p.maxVelocity = 1 + Math.random() * 1
        p.damping = 0.94 + Math.random() * 0.14
        p.attractionStrength = .01 + Math.random() * .1
        p.repulsionStrength = 23 + Math.random() * 20
    })
}

const randomSettingsFromTable = function (points, name) {
    const s = confTable.get(name)
    const r = Math.random

    const setKey = function (p, k) {
        const sk = `${k}Random`
        p[k] = s[k] + r() * s[sk]
    }

    const ks = [
        "minDistance"
        , "minVelocity"
        , "maxVelocity"
        , "damping"
        , "attractionStrength"
        , "repulsionStrength"
    ]

    points.forEach(p => {
        ks.forEach(k => setKey(p, k))
    })
}

class MainStage extends Stage {

    mounted() {
        var points = PointList.generate.random(200, 500);
        points.forEach(p => {
            p.vx = 0
            p.vy = 0
            p.radius = 5
        })

        this.points = points
        this.target = this.center.copy()
        this.dragging.add(this.target)
        // randomizeSettingsCrowd(points)
        randomSettingsFromTable(points, 'tight')
    }

    draw(ctx) {
        this.clear(ctx)
        const points = this.points
        let target = this.target
        simpleCluster(points, target, {
                // func: gravitateSquareDistance // clusterStyleB // clusterStable
                // func: clusterStyleB // clusterStable
                // func: clusterStable
                func: clusterDucks
                , followNearestCount: 3
                // , maxVelocity: 2
                // , method: 'springy'
            })

        points.forEach(faceVelocity)
        target.pen.indicator(ctx, {color:'red'})
        points.pen.lines(ctx, 'red', {color:'#33aa99'})
        // points[10].pen.fill(ctx, {color:'#115511'})
        // points.pen.indicators(ctx, {color:'#33aa99'})
        // points.pen.circle(ctx, {color:'#33aa99'})
        // points.centerOfMass().pen.indicator(ctx, {color: 'orange'})
        points.centerOfMass().pen.circle(ctx, {color: 'orange'})
    }
}




const stage = new MainStage('playspace')
stage.loopDraw()
// stage.go()
