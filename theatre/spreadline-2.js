/*
---
title: Spread Line
src_dir: ../point_src/
files:
    ../point_src/core/head.js
    point
    pointlist
    mouse
    dragging
    stroke
    ../point_src/stage.js
    ../point_src/split.js
    ../point_src/jiggle.js
    ../point_src/random.js
---
*/

class SpreadLines extends PointList {

    static spawn(generalRadius=20, hue) {
        let items = PointList.generate.random(20,
            [300, 200, null, 0],
            [100, 100, 10, 0]
        )

        items.each.hue = hue;
        items.each.z = (p) => Math.random()
        items.each.radius = (p) => generalRadius * p.z

        items.forEach((p)=>{
                let v = (1 - p.z) * random.float(.1, .4)//Math.random()
                p.jiggler.options.speedReducer = v
                p.jiggler.options.height = 10 * p.z
        })

        return SpreadLines.from(items)
        // return items
    }

    render(ctx, minSaturation=10 /*percent*/, generalLineWidth=4) {
        this.forEach(function(p){
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
    }
}


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
        this.pl = SpreadLines.spawn(generalRadius, hue)
    }

    draw(ctx){
        this.clear(ctx)
        let generalLineWidth = 5
        let minSaturation = 10 /*percent*/
        ctx.lineCap = "round"
        this.pl.render(ctx, minSaturation, generalLineWidth)
    }
}


;stage = MainStage.go();