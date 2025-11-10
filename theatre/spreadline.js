/*
---
title: Point Spread Line
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/split.js
    ../point_src/jiggle.js
    ../point_src/random.js
---
*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.makePl()
        let a = this.a = new Point({x:200,y:200, radius: 50, rotation: 0})
        this.dragging.add(a)
        this.events.wake()
    }

    onClick(){
        this.makePl()
    }

    makePl() {
        let generalRadius = 40
        let hue = (Math.random() * 360).toFixed(1)

        this.pl = PointList.generate.random(20,
                [300, 200, null, 0],
                [100, 100, 10, 0]
            )

        this.pl.each.hue = hue;
        this.pl.each.z = (p) => Math.random()
        this.pl.each.radius = (p) => generalRadius * p.z

        this.pl.forEach((p)=>{
                let v = (1 - p.z) * random.float(.1, .4)//Math.random()
                p.jiggler.options.speedReducer = v
                p.jiggler.options.height = 10 * p.z
        })


    }

    draw(ctx){
        let generalLineWidth = 5
        let minSaturation = 10 // percent
        this.clear(ctx)
        ctx.lineCap = "round";
        // this.a.rotation += .5
        let a = this.a
        // this.pl.pen.indicator(ctx, { color:'#444'})
        this.pl.forEach(function(p){
            let hue = p.hue - (100 * p.z)
            /* Build a saturation value from the Z */
            let saturation = ( (50 * (1-p.z) ) + minSaturation)
            let cleanSat = clamp(70-saturation, 10, 60).toFixed(1)


            let color = `hsl(${hue}deg 100% ${cleanSat}%)`

            p.jiggler.step()
            let pp = p.jiggler.point
            pp.split(2).pen.line(ctx, {
                    color
                    , width: generalLineWidth * p.z
                })
        })

        // this.a.pen.indicator(ctx, { color:'#444'})
        // this.a.split(2).pen.line(ctx, {color: 'red', width: 3})

    }
}


;stage = MainStage.go();