/*
title: Simple Chain
categories: chain
    rope
    constraints
files:
    head
    pointlist
    point
    stage
    stroke
    mouse
    dragging
    ../point_src/random.js
---

This example acts very similar to the leashing method but with more focused steps (less code.)

*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.points = PointList.generate.random(10, [100, 200], [0,0, 5, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0 })
        })

    }

    updatePoints(points, target) {
        const distance = 20;
        points.forEach((point, index) => {
            const dx = target.x - point.x;
            const dy = target.y - point.y;
            const angle = Math.atan2(dy, dx);

            point.x = target.x - Math.cos(angle) * distance;
            point.y = target.y - Math.sin(angle) * distance;

            target = point;
        });
    }

    draw(ctx){
        this.clear(ctx)
        this.updatePoints(this.points, this.mouse.point)
        this.points.pen.indicator(ctx)
    }
}


;stage = MainStage.go();