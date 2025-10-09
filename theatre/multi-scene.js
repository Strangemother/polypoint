/*
title: Multi Scene
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

This example has two running stages extending a single `BaseStage`.
Both scenes run concurrently on the canvas.

Only one `draw` method has a `clear` function, else we'd have two clear routines
per draw.
*/

class BaseStage extends Stage {
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
}


class StageOne extends BaseStage {
    canvas='playspace'

    draw(ctx){
        this.clear(ctx)
        this.updatePoints(this.points, this.mouse.point)
        this.points.pen.line(ctx, { color: 'red'})
    }
}


class StageTwo extends BaseStage {
    canvas='playspace'

    draw(ctx){
        // this.clear(ctx)
        this.updatePoints(this.points, this.mouse.point)
        this.points.pen.circle(ctx, {color: 'green'})
    }
}


;stage1 = StageOne.go();
;stage2 = StageTwo.go();