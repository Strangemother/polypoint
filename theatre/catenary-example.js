/*
---
title: Catenary
categories:
    curve
    catenary
files:
    head
    stroke
    pointlist
    point
    mouse
    dragging
    ../point_src/functions/clamp.js
    ../point_src/catenary-curve.js
    ../point_src/curve-extras.js
    stage
 */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.a = new Point({x:100, y:100, radius: 10, rotation: 0})
        this.b = new Point({x:290, y:200, radius: 10, rotation: 270})
        this.dragging.addPoints(this.a, this.b)
        this.tick = 0
        this.curve = new CatenaryCurve(this.a, this.b, 400)
        // this.curve.useCache = false;
    }

    onClick(ev) {
        console.log('set')
        this.curve.clear()
    }

    draw(ctx){
        this.clear(ctx)
        let a = this.a;
        let b = this.b;
        this.tick += 1
        // this.curve.update(ctx, this.tick)
        // this.curve.updateSwing(ctx, this.tick)
        // this.curve.render(ctx)

        this.curve.draw(ctx)

        a.pen.indicator(ctx)
        b.pen.indicator(ctx)
    }
}


;stage = MainStage.go();