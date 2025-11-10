/*
category: arcs
title: Experimental: Arc Line V3
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/text/beta.js
    mouse
    ../point_src/random.js
    dragging
    stage
    stroke
    ../point_src/split.js
    ../point_src/bisector.js
    ../point_src/angle.js
    ../point_src/tangents.js
*/

const isOuterPoint = function(p, nextPoint) {
    return calculateAngle(p, nextPoint) > 180
    // return obtuseBisect(previousPoint, p, nextPoint) > -1
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = this.center.copy().update({radius: 100})
        this.points = new PointList(
                [233, 325, 20]
                , [189, 169, 30]
                , [442, 113, 30]
                , [626, 215, 70]
                , [525, 419, 20]
            ).cast()

        this.regenerate()
        this.dragging.add(...this.points)
    }

    regenerate() {
        this.biPoints = this.generate(this.points)
        this.tangentPoints = this.generateTangents(this.biPoints)
    }

    generateTangents(biPoints) {
        /* Built tangent lines to later plot*/
        let res = []
        biPoints.forEach((pair, i, items)=>{
            let [a, b] = pair
            let [c, d] = items[i+1] == undefined? items[0]: items[i+1]
            let m1 = items[i-1] == undefined? items[items.length-1]: items[i-1]
            // let outer = a.isOuterPoint = calculateAngle(a, c)
            let outer = acuteBisect(m1[1], items[i][1], c)
            outer = convertAngle180Split(radiansToDegrees(outer))
            //[a.radius, b.radius, c.radius, d.radius]
            if(outer < 0) {
                res.push(b.tangent.bb(d))
            }else {
                res.push(b.tangent.aa(d))
            }

            // res.push(b.tangent.outerLines(d).b)
        })

        return res;
    }

    generate(points) {
        let res = [];

        points.forEach((p, i, a)=>{
            // two points for each given.
            if(i==0) {
                // manual _lookat_, then 90 degree rotated.
                // let rads = p.directionTo(points[i+1])
                // p.rotation = (new Angle(rads, 'rad').deg) + 90

                // Looped
                p.radians = acuteBisect(points[points.length-1], points[i], points[i+1])

            } else if(points[i+1] == undefined){
                // let rads = p.directionTo(points[i-1])
                // p.rotation = (new Angle(rads, 'rad').deg) - 90
                p.radians = acuteBisect(points[i-1], points[i], points[0])
            } else {
                p.radians = acuteBisect(points[i-1], points[i], points[i+1])
            }

            let pins = p.split(2)
            pins.each.radius = p.radius
            res.push(pins)
        })

        return res;
    }

    draw(ctx){
        this.clear(ctx)
        this.points.pen.line(ctx, {color:'#444'})
        // manually close the loop.
        this.points.last().pen.line(ctx, this.points[0])
        this.regenerate()

        this.biPoints.forEach(pair=>{

            pair[0].pen.circle(ctx, {color: '#555'})
            // outside point.
            pair[1].pen.circle(ctx, {color: '#880000'})
            // pair.forEach(p=>p.pen.circle(ctx, {color:'#555'}))
        })

        this.points.pen.indicator(ctx)

        this.tangentPoints.forEach(pair=>{
            let [a,b] = pair;
            new Point(a).pen.line(ctx, b)

            pair.forEach(p=>{
                new Point(p).pen.circle(ctx, {color:'#555'})
            })
        })
    }
}


stage = MainStage.go(/*{ loop: true }*/)

