/*
title: Street Plot
files:
    head
    pointlist
    point
    stage
    stroke
    mouse
    dragging
    ../point_src/random.js
    ../point_src/curve-extras.js
    ../point_src/split.js
---

Top Down City Planning
*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    // autoEvents = true /* Default */

    mounted(){
        this.a = new Point(300, 300, 50, -90)
        this.b = new Point(500, 500, 90, 90)
        // this.events.wake()
        let lpoints = [this.a, this.b]
        this.line = new BezierCurve(...lpoints)
        this.line.getControlPoints = function(useCache=this.useCache) {
            if(useCache === true && this.cachedControlPoints) {
                return this.cachedControlPoints
            }

            let a = this.a, b = this.b
              ;
            let cached = [
                  a.project(a.radius * 3)
                , b.project(b.radius * 3)
            ]

            this.cachedControlPoints = cached;
            return cached
        }

        this.line.doTips = false;
        this.dragging.add(this.a, this.b)
    }

    onClick(ev) {
        this.clickPoint = Point.from(ev)
    }

    draw(ctx){
        this.clear(ctx)
        if (this.line.a.wasDirty || this.line.b.wasDirty) {
            this.bits = this.line.split(100, 1)
            this.bits.each.radius = 20
        }
        this.a.pen.circle(ctx, {color:'#aaa'})
        this.b.pen.circle(ctx, { color: '#aaa' })
        this.bits.pen.lines(ctx, { color: '#aaa' })
        this.line.render(ctx, {color: 'green', width: 3})
        // this.clickPoint && this.clickPoint.pen.fill(ctx, '#880000')
    }
}

stage = MainStage.go()
