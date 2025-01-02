/*
---
title: Jiggle
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
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/relative.js
    ../point_src/keyboard.js
    ../point_src/automouse.js
    ../point_src/dragging.js
    ../point_src/iter/alpha.js
    ../point_src/text/alpha.js
    ../point_src/text/label.js
    ../point_src/text/beta.js
    ../point_src/jiggle.js

---

Speedy motion at a singular position.
https://youtube.com/clip/UgkxbshWOsMf_ukuMO-Zq9Mimj1UYlFDIQ9Q?si=RgotghYr0We685BC
 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let pl = new PointList()
        this.origin = this.center.copy().update({radius: 9})
        this.jiggler = new Jiggler(undefined, this.origin)
        this.jiggler2 = new Jiggler()

        this.pl = pl
        pl.push(new Jiggler())
        pl.push(new Jiggler())
        pl.push(new Jiggler())
        pl.push(new Jiggler())

        this.dragging.addPoints(this.origin)
    }

    draw(ctx){
        this.clear(ctx)

        this.pl.each.step()
        this.pl.forEach(p=>{
            p.point.pen.fill(ctx, '#22BB55')
        })
        let jPoint = this.jiggler.point
        let updates = this.calcDistanceChanges(jPoint)

        this.jiggler.step(updates)
        this.jiggler2.step()

        let j2 = this.jiggler2.point.add(this.center.copy())

        jPoint.pen.fill(ctx, '#22BB55')
        j2.pen.fill(ctx, '#000')

    }

    calcDistanceChanges(jPoint) {
        let reducer = (20 / this.mouse.point.distanceTo(jPoint))
        reducer = clamp(reducer, .1, 1)
        return {
            width: clamp(reducer * 10, 1, 3)
            , height: clamp(reducer * 10, 1, 3)
            , reducer
        }

    }
}

;stage = MainStage.go();