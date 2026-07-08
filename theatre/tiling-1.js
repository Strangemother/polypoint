/*
---
title: Spread Line
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


const range = function(count){
    return Array.from(Array(5).keys())
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
        this.pls = this.tri(1)
    }

    cubic(rows=5) {
        let generalRadius = 40
        let count  = 10
        let spread  = 100

        let pls = []
        range(rows).forEach((i)=>{
            pls.push(
                this.genList(count, spread, {x: 100, y: 100+(100 * i)})
            )
        })
        return pls;
    }

    tri(rows=5) {
        let generalRadius = 40
        let count  = 10
        let spread  = 100

        let pls = []
        range(rows).forEach((i)=>{
            pls.push(
                this.genList(count, spread, {
                        x: 100+(50 * +( i % 2 == 0))
                        , y: 100+(60 * i)})
            )
        })
        return pls;
    }

    hexa(rows=1) {
        function hexGrid(edgeLength){
            var len = 2*edgeLength - 1,
                vx = Math.sin(Math.PI/6), vy = Math.cos(Math.PI/6),
                tl = edgeLength - 1, br = 3*edgeLength - 2,
                positions = [];

            for(var y = 0; y < len; ++y){
                for(var x = 0; x < len; ++x){
                    //you may want to remove this condition
                    //if you don't understand the code
                    if(x+y < tl || x+y >= br) continue;
                    positions.push({
                        x: vx*y + x,
                        y: vy*y
                    });
                }
            }
            return positions;
        }

        let generalRadius = 40
        let count  = 2
        let spread  = 100

        let pls = []
        range(rows).forEach((i)=>{
            pls.push(
                this.genList(count, spread, {
                        x: 100+(50 * +( i % 2 == 0))
                        , y: 100+(60 * i)})
            )
            // pls.push(
            //     this.genList(count, spread, {
            //             x: 100+(50 * +( i % 2 == 0))
            //             , y: 200+(60 * i)})
            // )
        })
        return pls;
    }

    genList(count, spread, offset){
        const gen = PointList.generate;
        return gen.list(count, new Point(spread, 0), offset)
    }

    draw(ctx){

        this.clear(ctx)
        // this.pl.pen.indicator(ctx, { color:'#444'})
        this.pls.forEach((pl)=>{
            pl.forEach(function(p){
                let color = `hsl(40deg 100% 30%)`
                p.pen.fill(ctx, color)
            })
        })
    }
}


;stage = MainStage.go();