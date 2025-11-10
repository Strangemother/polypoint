/*
---
title: Point Jiggle Effect
categories: iteration
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
        this.originA = this.center.copy().update({radius: 9})
        this.originA.y -= 100

        this.originB = this.center.copy().update({radius: 9})
        this.originB.y -= 20

        this.originC = this.center.copy().update({radius: 9})
        this.originC.y += 70

        this.originD = this.center.copy().update({radius: 9})
        this.originD.y += 160

        this.jigglerA = new Jiggler(undefined, this.originA)

        this.jigglerB = new Jiggler({
            speedReducer: 1
            , xSpeed: .5
            , ySpeed: .7
        }, this.originB)

        this.jigglerC = new Jiggler({
            speedReducer: .3
            , width: 10
            , height: 10
            , xSpeed: .5
            , ySpeed: .7
        }, this.originB)

        this.jigglerD = new Jiggler({
            speedReducer: 2
            , width: 10
            , height: 1
            , xSpeed: .2
            , ySpeed: .1
        }, this.originC)

        this.jigglerE = new Jiggler({
            speedReducer: .7
            , width: 3
            , height: 10
            , xSpeed: .5
            , ySpeed: .4
        }, this.originD)

        this.dragging.addPoints(this.originA,
                                this.originB,
                                this.originC,
                                this.originD)
    }

    draw(ctx){
        this.clear(ctx)

        this.jigglerA.step()
        this.jigglerB.step()
        this.jigglerC.step()
        this.jigglerD.step()
        this.jigglerE.step()

        this.jigglerA.point.pen.fill(ctx, '#22BB55')

        this.jigglerC.point.pen.fill(ctx, '#009911')
        this.jigglerB.point.pen.fill(ctx, '#22BB55')

        this.jigglerD.point.pen.fill(ctx, '#009911')
        this.jigglerE.point.pen.fill(ctx, '#009911')
    }
}

;stage = MainStage.go();