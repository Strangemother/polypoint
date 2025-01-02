/*
---
title: Rel Function
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


const rel = function(value) {
    return function relCaller(p, k) {
        console.log('Call once')
        return p[k] + this.value
    }.bind({value})
}


const boundCaller = function(func) {
    return function relCaller(p, k) {
        console.log('Call once')
        return func.bind(p)
    }
}


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let a = this.a = new Point({x:200,y:200, radius: 40, rotation: 0})
        this.dragging.add(a)
        this.events.wake()

        a.x = rel(200)

        a.y = boundCaller((p, k) => {
            return 200
        })
    }

    // onClick(){

    // }

    draw(ctx){

        this.clear(ctx)
        // this.pl.pen.indicator(ctx, { color:'#444'})
        let color = `hsl(90deg 100% 30%)`
        this.a.pen.fill(ctx, color)
    }
}


;stage = MainStage.go();