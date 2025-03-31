/*
title: Psuedo Blur
category: gradient
tags: blur
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/functions/rel.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/gradient.js

Here we attempt a psuedo _blur_ by generating a gradient layer matching
the primary point.

Inspired by this beautiful unsplash https://unsplash.com/@randomrenders

 */
class MainStage extends Stage {
    canvas='playspace'
    mounted(){

        let a = this.a = this.center.copy().update({
                radius: 150
                , x: rel(350)
                , y: rel(100)
            });

        this.b = this.center.copy().update({
                radius: 300
                , x: rel(-200)
                , y: rel(-200)
            })
        this.mountGrad()
    }

    mountGrad(){
        let c = this.center
        this.primaryPoint = c.copy().update({
                radius: 350
                , x: rel(20)
                , y: rel(200)
            })

        let darkPurple = '#7301bd'
        let polyPink = 'hsl(299deg 62% 44%)'
        let brightPink = '#ae28fd'
        let blurPink = '#9e2ce6'
        let grey = "#272729"
        let darkGrey = '#171719'
        let peak = "#c62cfd"

        this.gradInner = this.primaryPoint.copy().update({radius: rel(-190), color:blurPink})
        this.gradOuter = this.primaryPoint.copy().update({
                radius: rel(90)
                , y: rel(-90)
                , color: grey
            })
        this.gradOutest = this.primaryPoint.copy().update({ radius: rel(90), color: darkGrey})

        this.pointGradInner = this.primaryPoint.copy().update({ radius: rel(-250), color:blurPink})
        this.pointGradOuter = this.primaryPoint.copy().update({ radius: rel(-10), color: darkPurple}) // dark
        // this.gradOuter = c.copy().update({color: "hsl(244deg 71% 56%)"}) // dark
        // this.g = (new Gradient).radial(this.gradInner, this.gradOuter)
        this.dragging.add(
                // this.gradInner,
                // this.gradOuter,
                // this.gradOutest,
                // this.pointGradInner,
                // this.pointGradOuter,
                this.a,
                this.b,
                this.primaryPoint
            )

        this.blurGrad = (new Gradient).radial(this.gradInner, this.gradOuter)
        this.blurGrad.addStops({
            0: peak,
            0.1: this.gradInner,
            ".6": this.gradOuter,
            1: this.gradOutest
        })

        this.pointGrad = (new Gradient).radial(this.pointGradInner, this.pointGradOuter)
        this.pointGrad.addStops({
            0: this.pointGradInner,
            1: this.pointGradOuter
        })
    }


    draw(ctx){
        this.clear(ctx)
          ctx.rect(0, 0, this.canvas.width, this.canvas.height);
          ctx.fillStyle = '#000';
          ctx.fill();
        let a = this.a
            , b = this.b
            ;

        this.blurGrad.radial() // refresh hack.
        this.pointGrad.radial() // refresh hack.

        let grad = this.blurGrad.getObject(ctx)
        let pointGrad = this.pointGrad.getObject(ctx)

        this.primaryPoint.pen.fill(ctx, pointGrad)

        // this.gradInner.pen.circle(ctx, undefined, 'white', 1)
        // this.gradOuter.pen.circle(ctx, undefined, '#DDD', 1)

        // this.gradOutest.pen.circle(ctx, undefined, '#BBB', 1)

        // this.primaryPoint.pen.fill(ctx, '#333')

        a.pen.fill(ctx, grad)
        b.pen.fill(ctx, grad)

        // this.gradInner.pen.fill(ctx, 'white', 2)
        // this.pointGradInner.pen.circle(ctx, undefined, 'white', 1)
        // this.pointGradOuter.pen.circle(ctx, undefined, 'red', 1)
    }
}

;stage = MainStage.go();