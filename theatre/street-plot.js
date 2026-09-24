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
    ../point_src/split-v2.js
---

Top Down City Planning
*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    // autoEvents = true /* Default */

    mounted(){
        this.a = new Point(200, 300, 120, 10)
        this.b = new Point(800, 500, 140, -190)
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
            // this.bits = this.line.split(50)
            this.bits = this.line.split(~~(this.line.length / 15), {
                even: true
                , every: 10
            })
            // this.bits = this.line.splitInner(~~(this.line.length/15))

            // this.bits = this.line.splitAnimated(60, 1, .1)
            // this.bits = this.line.splitHinted(100)
            // this.bits.each.radius = ()=> random.int(15, 40) * random.choice([1, -1])// (e, i)=> (i + 1) * 1.3
            this.bits.each.radius = ()=> random.flip(random.int(5, 10))
        }

        this.a.pen.circle(ctx, {color:'#111'})
        this.b.pen.circle(ctx, { color: '#111' })
        this.bits.pen.lines(ctx, { color: '#aaa' })
        this.line.render(ctx, {color: 'darkgreen', width: 2})
        // this.clickPoint && this.clickPoint.pen.fill(ctx, '#880000')
    }
}

stage = MainStage.go()
