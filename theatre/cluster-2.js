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

points[10].color = 'white'


const  randomizeSettingsCrowd = function(points) {
    points.forEach(p => {
        p.minDistance = 100 + Math.random() * 100
        p.minVelocity = 0.1 + Math.random() * 0.1
        p.maxVelocity = 1 + Math.random() * 1
        p.damping = 0.94 + Math.random() * 0.14
        p.attractionStrength = .01 + Math.random() * .1
        p.repulsionStrength = 23 + Math.random() * 20
    })
}


const  randomizeSettingsRandomStable = function(points) {
    points.forEach(p => {
        p.minDistance = 400 + Math.random() * 100
        p.minVelocity = 0.1 + Math.random() * 0.1
        p.maxVelocity = 1 + Math.random() * 3
        p.damping = 0.99 + Math.random() * 0.01
        p.attractionStrength = .01 + Math.random() * .1
        p.repulsionStrength = 23 + Math.random() * 20
    })
}


const  randomizeSettingsMoshPit = function(points) {
    points.forEach(p => {
        p.minDistance = 40 + Math.random() * 100
        p.minVelocity = 0 // 0.01 + Math.random() * 0.1
        p.maxVelocity = 1 + Math.random() * 1
        p.damping = 0.999 + Math.random() * 0.01
        p.attractionStrength = .1 + Math.random() * .1
        p.repulsionStrength = 10 + Math.random() * 20
    })
}

const  randomizeSettings = function(points) {
    points.forEach(p => {
        p.minDistance = 100 + Math.random() * 10
        p.minVelocity = 0.01 + Math.random() * 0.1
        p.maxVelocity = 10 + Math.random() * 5
        p.damping = .8 + Math.random() * 0.01
        p.attractionStrength = 1 + Math.random() * .5
        p.repulsionStrength = 300 + Math.random() * 20
    })
}

class MainStage extends Stage {

    mounted() {
        this.target = this.center.copy()
        this.dragging.add(this.target)
        randomizeSettings(points)
    }
    
    doTracking = false
    doRotate = false
    doZoom = false
    
    viewportTrack(ctx, target, others) {
        /* focus on the target by moving the others. */
        // get offset from center.
        let v = this.doTracking
        let t = target.xy
        let c = this.center.xy
        v = [c.x - t.x, c.y - t.y]
        let s = 1 + (this.mouse.wheelSize() * .1)

        if (this.doRotate) {
            this.viewport.rotateZoomTranslate(ctx, c, target, s)
        }

        if (this.doTracking) {
            // Shift the canvas to ensure the target is
            // at the center.
            if (!this.doRotate && this.doZoom) {
                this.viewport.zoomTranslate(ctx, c, s)
            }
            ctx.translate(...v);
        }
    }

    viewport = {

        rotateZoomTranslate(ctx, c, target, s=2) {
            // First we translate to the _center_
            ctx.translate(c.x, c.y);
            // spin opposite to the display direction
            ctx.rotate(-target.radians - (Math.PI * .5))
            ctx.scale(s, s)
            // Move the canvas back to its initial place (now rotated)
            ctx.translate(-c.x, -c.y);
        }

        , zoomTranslate(ctx, c, v) {
            ctx.translate(c.x, c.y);
            ctx.scale(v,v)
            ctx.translate(-c.x, -c.y);
        }
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
        this.viewportTrack(ctx, points[10], points)
        target.pen.indicator(ctx, {color:'red'})
        // points.pen.lines(ctx, 'red', {color:'#33aa99'})
        points[10].pen.fill(ctx, {color:'#115511'})
        points.pen.indicators(ctx, {color:'#33aa99'})
        // points.pen.circle(ctx, {color:'#33aa99'})
        points.centerOfMass().pen.indicator(ctx, {color: 'pink'})
        if (this.doTracking) {
            // reset any tranlate or rotate
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

const stage = new MainStage('playspace')
stage.loopDraw()
// stage.go()
