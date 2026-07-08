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
        this.c = new Point({x:150, y:150, radius: 50})

        this.tick = 0
        this.curve = new CatenaryCurve(this.a, this.b, 400)
        this.curve.direction = Math.PI
        // this.curve.useCache = false;
        this.dragging.addPoints(this.a, this.b, this.c)
    }

    onClick(ev) {
        console.log('set')
        this.curve.clear()
    }

    draw(ctx){
        this.clear(ctx)
        let a = this.a;
        let b = this.b;
        let c = this.c;
        this.tick += 1

        if(a.wasDirty || b.wasDirty || c.wasDirty) {
            this.curve.direction = c.radians
            this.curve.clear()
        }

        this.curve.draw(ctx)

        a.pen.indicator(ctx)
        b.pen.indicator(ctx)
        this.c.pen.indicator(ctx)
    }
}


;stage = MainStage.go();