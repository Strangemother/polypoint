/*
title: Brownian Walker
categories: brownian
    random
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/functions/range.js
    ../point_src/relative.js
    ../point_src/constrain-distance.js
    ../point_src/screenwrap.js
---

A tiny walker to move towards a browian point.
*/


let fleeSettings = {
    tailLength: 3,
    turnSpeed: .18,
    maxTouchDistance: 6,
    viewSpaceOffset: 10,
    viewSpaceMultiplerSize: 3,
    forwardSpeed: 1.7,
    leashDistanceMultiplier: 2,
    radius: 1.2,
    color: 'green',
}


const sliderValue = function(value, min, max, step) {
    let d = {}
    if(step != undefined) { d.step = step }
    if(value != undefined) { d.value = value }
    if(min != undefined) { d.min = min }
    if(max != undefined) { d.max = max }
    return d;
}

const sliders = {
      tailLength:              sliderValue(   3,   2, 40)
    , turnSpeed:               sliderValue( .18,  .1,  1,  .05)
    , maxTouchDistance:        sliderValue(   6,   6, 20)
    , viewSpaceOffset:         sliderValue(  10,  10, 30)
    , viewSpaceMultiplerSize:  sliderValue(   3,   2, 20)
    , forwardSpeed:            sliderValue( 1.7,  .1,  3,  .10)
    , leashDistanceMultiplier: sliderValue(   2, 1.5, 20,   .2)
    , radius:                  { step: .10, value: 1.2, min: 1, max: 20 }
};

addSliderControlSet(sliders);

addButton('Generate', {
    onclick: ()=> {
        let d = {}
        for(let k in sliders) {
            d[k] = parseFloat(appShared.miniApp.controls[k].value)
        };

        stage.newWalker(Object.assign(d, { x: 300, y: 300}))
    }
})


class Walker extends Point {

    init(d) {
        this.updateSpeed = 20
        this.lookSpeedUpdateSpeed = 10
        this.touchSpaceUpdateSpeed = 10
        this.forwardSpeed = 1
        this.turnSpeed = .2
        this.maxTouchDistance = 10
        this.viewSpaceOffset = -20
        this.viewSpaceMultiplerSize = 10
        this.modu = d.modu ==undefined? 0: d.modu
        this.leashDistanceMultiplier = 1
        this.tailLength = 10

        this.viewPoint = new Point(this.copy())
        this.update(d)
        this.updateLookSpace()
    }

    step(delta=1){
        this.modu += 1
        if(this.modu % this.updateSpeed == 0) {
            this.updateWalker()
        }
        if(this.modu % this.lookSpeedUpdateSpeed == 0) {
            this.updateLookSpace()
        }
        if(this.modu % this.touchSpaceUpdateSpeed == 0) {
            this.updateTouchSpace()
        }

        this.turnTo(this.viewPoint, this.turnSpeed * delta)
        // this._relativeMove(this, new Point({x:1, y:0}), 1, )
        this.relative.forward(this.forwardSpeed * delta)
    }

    updateTouchSpace(){
        if(this.distanceTo(this.viewPoint) < this.maxTouchDistance) {
            this.updateWalker()
        }
    }

    updateWalker(max=.5) {
        this.updateLookSpace()
        this.viewPoint.xy = random.within(this.viewSpace, max)
    }

    updateLookSpace() {
        let eyeballSpace = this.viewSpaceOffset
        let viewSpaceSize = this.viewSpaceMultiplerSize
        let r = this.radius * viewSpaceSize
        this.viewSpace = this.project(
                r
                + this.radius
                + eyeballSpace
            ).update({radius: r})
    }

}

class TailWalker extends Walker {

    init(d) {
        super.init(d)
        this.points = PointList.generate.countOf(this.tailLength)
        this.points.each.radius = 2
        this.points.each.xy = this.xy
        this.points.unshift(this)
    }

    step(delta=1){
        super.step(delta)
        this.updateLeash()
    }

    updateLeash(){
        let h = this
        let leashLength = h.radius * h.leashDistanceMultiplier
        h.points.siblings().forEach((pair)=>{
            // pair[1].track(pair[0], leashLength)
            pair[1].leash(pair[0], leashLength)
        })
    }

}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        // this.screenWrap = new ScreenWrap()
        this.screenWrap.setDimensions({top: -50, left: -50, bottom: 900, right: 900})
        this.delta = 1
        this.doClear = true
        let s = this
        addButton('add', {
            onclick(){
                s.newWalker(Object.assign({ x: 300, y: 300}))
            }
        })

        addButton('add flee', {
            onclick(){
                s.newWalker(Object.assign(fleeSettings, { x: 300, y: 300}))
            }
        })

        addButton('clear', {
            onclick(){
                s.walkers = new PointList()
            }
        })

        this.walkers = new PointList()

        range(4).forEach(i=>{
            this.newWalker({modu: i})
        })


        // this.dragging.add(this.point)
    }

    freezeMode(){
        this.delta = .1
        this.doClear = false
    }

    newWalker(extra) {
        let w = this.generateWalker(this.genD(), extra)
        this.walkers.push(w)
        return w
    }

    genD(){
        let ri = random.int.bind(random);
        let rf = random.float.bind(random);

        let d = {
            lookSpeedUpdateSpeed: 10
            , touchSpaceUpdateSpeed: 10
            , updateSpeed: 50
            , forwardSpeed: rf(.1, 2)
            , turnSpeed: rf(.1, .3)
            , maxTouchDistance: ri(6, 20)
            , viewSpaceOffset: ri(10, 30)
            , viewSpaceMultiplerSize: ri(2,10)
            , leashDistanceMultiplier: ri(1.5,7)
            , tailLength: ri(2,5)
        }
        return d

    }

    generateWalker(d, d2) {
        d = Object.assign({}, d)
        let p = new TailWalker({
                        x:random.int(500)
                        , y:random.int(500)
                        , radius: random.float(.5, 3)
                        , rotation: random.int(160)
                        , color: random.color()
                        , modu: i
                    })

        p.init(Object.assign(d, d2));
        return p
    }

    draw(ctx) {
        this.doClear && this.clear(ctx)
        this.walkers.forEach(p=>{
            this.step(p, this.delta)
            this.drawPoint(ctx, p)
        })
    }

    drawPoint(ctx, h){
        ctx.lineWidth = 1

        // h.viewSpace.pen.circle(ctx, {color: '#222255'})
        // h.viewPoint.pen.fill(ctx, 'red', 1)

        ctx.lineWidth = h.radius
        h.points?.pen.quadCurve(ctx, h.color, false)
        // h.points?.pen.fill(ctx, '#aaa', 1)

        h.pen.fill(ctx, h.color)

        let sws = h.screenWrapSector
        if(sws?.dirty) {
            h.screenWrapSector_cache = `${sws.x}, ${sws.y}`
        }

        // h.text.offsetString(ctx, h.screenWrapSector_cache, {x:-10, y:-10})
        // this.point.text.plain(ctx, 'bob')
    }

    step(p, delta=1){
        let didChange = this.screenWrap.perform(p)
        p.step(delta)
        if(didChange) {
            p.updateWalker(.5)
        }
    }
}



stage = MainStage.go(/*{ loop: true }*/)
