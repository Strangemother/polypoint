/*
---
title: 3D Pseudo Rotation Plane
tags: pseudo3D
files:
    ../point_src/math.js
    head
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    point
    mouse
    stage
    dragging

Rotate a plane in 3D

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.mouse.zIndex = 'bound'
        setTimeout(this.resize.bind(this), 20)
    }

    step() {

    }

    draw(ctx){
        this.step()
        this.clear(ctx)
        this.center.pen.indicator(ctx, { color: 'gray', width: 1})
        this.mouse.point.pen.indicator(ctx, { color: 'gray', width: 1})
        // this.mouse.position.pen.indicator(ctx, { color: 'gray', width: 1})
    }
}

stage = MainStage.go()
