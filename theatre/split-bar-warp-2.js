/*
title: Split Bar Warp Effect V2
categories: split
    curve
tags: ribbon
files:
    ../point_src/math.js
    head
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
 */

class Ribbon {
    /* two lines, connected by many lines */
    constructor(settings) {
        if(settings != undefined) {
            this.setup(settings)
        }

    }

    setup(settings){
        this.settings = settings
        this.setupPairMethods()
        this.gWidth = 50
        let c = this.point = settings.point
        // this.count = 20
        let givenPoints = settings.points

        let l = givenPoints.length;
        let aMap = {
            1: ()=>{
                // split 4
                let gp = givenPoints[0]
                // gp.rotate(-45)
                let [a,b,c,d] = gp.split(4)
                let v = [b,a,c,d]
                v.forEach(p=>p.radius = gp.radius  * .25)
                return v
            }
            , 2: ()=>{
                // two points, split,
                return [...givenPoints[0].split(2), ...givenPoints[1].split(2)]
            }
        }
        let f = aMap[l]
        let points = new PointList(...(f? f(): givenPoints))
        // let points = new PointList(
        //       new Point(c.x-300, c.y-200, 50)
        //     , new Point(c.x+300, c.y-200, 50)
        //     , new Point(c.x-300, c.y+200, 50)
        //     , new Point(c.x+300, c.y+200, 50)
        // )

        this.points = points
        // let lpoints = [new Point(c.x-300, c.y-200, 50), new Point(c.x+300, c.y-200, 50)]
        // let lpoints2 = [new Point(c.x-300, c.y+200, 50), new Point(c.x+300, c.y+200, 50)]
        this.lineA = new Line(points[0], points[1])
        this.lineB = new Line(points[2], points[3])
    }

    setupPairMethods(){
        const lerpRadius = function(a, b, i, l) {
            /* Process the width from the _first_ to the _last_ of a line.*/
            // let av = ((asLast.radius - asFirst.radius) * (i/l))+asFirst.radius
            return ((b - a) * (i/l)) + a
        }

        let parent = this;
        const radiusManual = function(a, b, i, l) {
            let asFirst = parent.lineA[0]
            let asLast = parent.lineA[1]
            let bsFirst = parent.lineB[0]
            let bsLast = parent.lineB[1]

            /* Manual lerping from line points. */
            a.radius = lerpRadius(asFirst.radius, asLast.radius, i, l)
            b.radius = lerpRadius(bsFirst.radius, bsLast.radius, i, l)
        }

        const radiusDistance = function(a, b, i, l) {
            /* Auto by distance. */
            let d = a.distanceTo(b)
            a.radius = b.radius = d * .4
        }

        const radiusLocked = function(a, b, i, l) {
            /*locked.*/
            a.radius = b.radius = 100
        }

        const targetAtDistance = function(a, b, i, l) {
            let p = parent.settings.point;
            a.radius = 10 - p.radius + a.distanceTo(p)
            b.radius = 10 - p.radius + b.distanceTo(p)
            a.lookAt(p)
            b.lookAt(p)
        }

        return this.pairMethods = {
            lerpRadius
            , radiusManual
            , radiusDistance
            , radiusLocked
            , targetAtDistance
        }
    }

    update(){
        let count = this.settings.count
        if(count == undefined) { count = 10 }

        let normRelRotation = this.settings.normRelRotation
        if(!('normRelRotation' in this.settings)) {
            /* allow normRelRotation=undefined */
            normRelRotation = 90
        }

        let as = this.lineA.splitInner(count, -normRelRotation)
        let bs = this.lineB.splitInner(count, normRelRotation)

        this.pointsA = as
        this.pointsB = bs

        const createLine = function(a, b) {
            // let line = new Line(a, b)
            let line = new BezierCurve(a, b)
            line.doTips = false;
            return line;
        }

        let lines = []
        let l = as.length
        let pairUpdateFunction = this.getPairUpdateFunction()

        for (var i = 0; i < l; i++) {
            // radiusManual(as[i], bs[i], i)
            // radiusDistance(as[i], p, i)
            // radiusLocked(as[i], bs[i], i)
            pairUpdateFunction(as[i], bs[i], i, l)
            let line = createLine(as[i], bs[i])
            lines.push(line)
        };

        this._lines = lines
    }

    getPairUpdateFunction() {
        let n = this.settings.pairUpdateFunction
        return (typeof(n) == 'string')? this.pairMethods[n]: n
    }

    render(ctx) {
        let lines = this._lines
        let lc = {color: 'hsl(299deg 62% 44%)'}

        this.lineA.render(ctx, lc)
        this.lineB.render(ctx, lc)


        // this.pointsA.pen.indicators(ctx, {color:'#333'})
        // this.pointsB.pen.indicators(ctx, {color:'#333'})

        this.lineA.points.forEach(p=>p.pen.indicator(ctx), { line:{color:'#333'}})
        this.lineB.points.forEach(p=>p.pen.indicator(ctx), { line:{color:'#333'}})

        lines.forEach((l)=>{
            l.render(ctx, lc);
        });
    }
}

class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        let c = this.point = this.center.copy().update({ radius: 100})
        let container = c.copy().update({ radius: 300})
        container.rotate(-45)

        let r = this.ribbon = new Ribbon({
            points: [container]
            , count: 20
            , pairUpdateFunction: "targetAtDistance"
            // , pairUpdateFunction: "radiusDistance"
            // , pairUpdateFunction: "radiusManual"
            , point: c
            , normRelRotation: -90
        })

        let c2 = container.copy()
        c2.rotation += 90
        let r2 = this.ribbon2 = new Ribbon({
            points: [c2]
            , count: 20
            , pairUpdateFunction: "targetAtDistance"
            // , pairUpdateFunction: "radiusDistance"
            // , pairUpdateFunction: "radiusManual"
            , point: c
            , normRelRotation: -0
        })

        this.dragging.add(this.point, ...r.points, ...r2.points)
    }

    draw(ctx){
        this.clear(ctx)

        this.ribbon.update()
        this.ribbon2.update()

        this.ribbon.render(ctx)
        this.ribbon2.render(ctx)

        this.point.pen.circle(ctx, {color:'#DDD '})
    }
}


;stage = MainStage.go();