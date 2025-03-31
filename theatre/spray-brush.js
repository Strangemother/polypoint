/*
title: Spray
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    ../point_src/random.js
    ../point_src/table.js
---

On mouse down the _paint spray_ functionality plots many points near
the mouse position, using the `random.within(point)` method.

To make it efficient the stage doesn't _loop draw_ with a clearing layer. Instead
the _drawOnce_ occurs after every mouse move without the clear.
*/

let keys = [
    /* Random rotation per point every spray down */
    'randomPointRot' // : true
    /* If the randomPointRot is true*/
    , 'randomPointRotMin' // : 0
    , 'randomPointRotMax' // : 360
    /* Random radius per point every spray down */
    , 'randomPointRadius' // : true
    , 'randomPointRadiusMin'
    , 'randomPointRadiusMax'

    , 'randomPointColor' // : false
    , 'fillPointColor' // : false

    /* How many point to plot per spray down*/
    , 'sprayDownMin' // : 5
    , 'sprayDownMax' // : 20

    , 'walkTicker' // : 100

    /* resize the mouse based on its speed.*/
    , 'speedMouse' // : true
]

const confTable = new Table(keys, {
      'a': [true, 0, 360, true, .1, 3, true, false, 2, 50, 10, true]
      , 'b': [false, 0, 0, true, .1, 3, false, false, 5, 90, 50, false]
      , 'c': [true, 0, 360, true, .1, 3, false, false, 2, 9, 5, true]
      , 'd': [false, 0, 0, true, 1, 5, false, false, 2, 9, 50, false]
      , 'e': [true, 0, 360, true, .1, 3, true, false, 2, 50, 100, false]
      , 'f': [false, 0, 0, true, .1, 3, true, true, 2, 50, 900, true]
      , 'g': [false, 0, 0, true, .1, 3, false, true, 2, 50, 900, true]
})

const settings = confTable.get('f')

const _settings = {

    /* Random rotation per point every spray down */
    randomPointRot: true
    /* If the randomPointRot is true*/
    , randomPointRotMin: 0
    , randomPointRotMax: 360

    /* Random radius per point every spray down */
    , randomPointRadius: true
    , randomPointRotMin: .1
    , randomPointRotMax: 3

    , randomPointColor: false

    /* How many point to plot per spray down*/
    , sprayDownMin: 5
    , sprayDownMax: 20

    , walkTicker: 100

    /* resize the mouse based on its speed.*/
    , speedMouse: true
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        // this.dragging.add(...this.points)
        // this.events.wake()
        this.points = new PointList;
        this.mouse.point.radius = 30
        this.clicker = 0
    }

    maxDistance = 50
    projectionSpread = .3
    minSpeed = 20

    onMousedown(ev) {
        let delta = Infinity
        if(this.mouseUpTime) {
            delta = +(new Date) - this.mouseUpTime
        }

        if(delta < 100) {
            /* mouse click buffer */
            console.warn('fast click')
        }

        // console.log('start draw', delta)
        clearInterval(this.walkTicker)

        this.walkTicker = undefined
        this.clicker += 1
        console.log(this.clicker % 2)
        this.drawingLine = true
        this.startLine(Point.from(ev))
    }

    onMouseup(ev) {
        // console.log('stop draw')
        this.drawingLine = false
        this.stopLine(Point.from(ev))
        this.mouseUpTime = +(new Date)
    }

    onMousemove(ev) {
        if(this.drawingLine) {
            this.tickFunc()
        }
    }

    startLine(point) {
        /* Start a line at a position*/
        this.line = new PointList(point)
        this.walkTicker = setInterval(this.tickFunc.bind(this), settings.walkTicker)
    }

    stopLine(point) {
        this.line.push(point)
        clearInterval(this.walkTicker)
        this.walkTicker = undefined
    }

    tickFunc() {
        /* Tick event,
        if the distance is greater than the existing, add point.*/
        let mp = this.mouse.point
        let l = this.points
        let last = l.last()
        let perform = true;

        if(settings.speedMouse) {
            mp.radius = clamp(this.mouse.speed(), 3, 50)
        }
        if(last) {
            last.lookAt(mp)
            if(mp.distanceTo(last) < this.maxDistance) {
                perform = false;
            }
        }

        if(perform){

            // l.push(mp.copy())
            // this.points.push(...this.brushAt(mp))
            let rv = random.int(settings.sprayDownMin,settings.sprayDownMax)
            let sprayPoints = this.brushAt(mp, rv)
            this.drawOnce(sprayPoints)
        }
    }

    brushAt(mp, rv=random.int(5,20)){
        let ps = new PointList()
        for (var i = rv - 1; i >= 0; i--) {
            let p = new Point(random.within(mp))
            if(settings.randomPointRadius){
                p.radius = random.float(
                settings.randomPointRadiusMin,
                settings.randomPointRadiusMax)

            }

            if(settings.randomPointRot){
                p.rotation = random.int(
                    settings.randomPointRotMin,
                    settings.randomPointRotMax)
            }

            p.color = random.color()

            ps.push(p)
        }
        return ps
    }

    drawOnce(points, veryRandom=undefined){
        // this.clear(ctx)
        let color = random.color
        let v = this.clicker % 2

        let ri = ()=>random.int(0, 100)
        let rd = ()=>random.int(0, 360)
        color = ()=>`hsl(${rd()}deg ${ri()}% ${ri()}%)`

        if(veryRandom == undefined) {
            veryRandom = settings.randomPointColor
        }

        let conf = veryRandom? {color}: {color: color()}
        if(settings.fillPointColor){
            points.pen.fill(this.ctx, conf.color)
        }else {
            points.pen.indicator(this.ctx, conf)
        }
    }
}

stage = MainStage.go({ loop: false })
