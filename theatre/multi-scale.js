/*
title: Multi-Scale Canvas
categories: scaling
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/bisector.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
---

Multiscale assigns a map of relative sizes. Upon `update` the points are tested
for their expected size. If the current size does not match the expected, a rescale
of all points is performed.

    alpha: 1
    , beta: 2
    , charlie: 3
    , delta: 8
    , echo: 1.2
*/

const ratios = {
    alpha: 1
    , beta: 2
    , charlie: 3
    , delta: 8
    , echo: 1.2
}


class RatioMachine {
    constructor(points) {

        this.expected = {}
        this.points = points
    }

    update(points=this.points) {
        let ms = new Set()
        for(let p of points) {
            let expected = this.getExpected(p)
            if(p.radius != expected) {
                console.log('mismatch on', p.uuid)
                ms.add(p)
            }
        }

        if(ms.size > 1) {
            console.warn('size mismatch')
        }
        this.updateRatio(...ms)
    }

    updateRatio(...ms) {
        // Update the ratio given the
        // value of init P.
        let p = ms[0]
        if(p == undefined) {return}
        let ratio = p._ratioName
        let expected = ratios[ratio]
        let newBase = p.radius * .2
        let mul = newBase / expected
        console.log(ratio, newBase, expected, mul)

        let i = 0
        for(let name in ratios) {
            let value = ratios[name];
            let p  = this.points[i]
            this.expected[p.uuid] = p.radius = (value * mul) * 5
            p._ratioName = name
            i++
        }
    }

    getExpected(p) {
        return this.expected[p.uuid]
    }

    setRatios(ratios){
        let i = 0
        for(let name in ratios) {
            let value = ratios[name];
            let p  = this.points[i]
            this.expected[p.uuid] = p.radius = value * 5
            p._ratioName = name
            i++
        }
    }
}


class MainStage extends Stage {
    canvas='playspace'

    // live=false
    live = true
    mounted(){
        let stage = this
        addButton('update', {
            onclick(){
                stage.rm.update()
            }
        })
        this.plotRadi()
        // this.points = PointList.generate.random(Object.values(ratios).length, 500)
        this.dragging.add(...this.points)
        this.clones = this.points.copy(true) // deep
    }

    plotRadi(){
        // this.points = PointList.generate.random(Object.values(ratios).length, 500)
        this.points = PointList.generate.list(Object.values(ratios).length, 150, [100,100])
        this.rm = new RatioMachine(this.points)
        this.rm.setRatios(ratios)
    }

    draw(ctx){
        this.clear(ctx)
        this.clones.pen.indicators(ctx, {color: '#555'})
        this.points.pen.indicators(ctx)
    }

}


; stage = MainStage.go();