/*
title: Elbow Constraints
category: constraints
files:
    head
    point
    stroke
    ../point_src/point-content.js
    pointlist
    mouse
    dragging
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/mirror.js
    ../point_src/stage.js
    ../point_src/text/label.js
    ../point_src/intersections.js
    ../point_src/cone.js
    ../point_src/easing.js
    ../point_src/constrain-distance.js
---

An elbow contraint ensures a target point is _connected_ to another point, at
a distance of the two radii.

        point.constraint.elbow(other)

It's called an elbow, as there will always be an intersection at the max distance.
Similar to rings bound at the edge.

Synonymous to:

    let pA = this.legL
    let pB = this.primaryPoint

    pA.leash(pointB,
        (pB.radius + pA.radius) - .01)
    pA.avoid(pointB,
        Math.abs(pB.radius - pA.radius) + .01)

*/


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        console.log('main')
        this.a = new PointList(
                {x:180,y:360, radius:20}
                , {x:200,y:320, radius:20}
                , {x:240,y:290, radius:20}
                , {x:240,y:240, radius:20}
                , {x:250,y:170, radius:20}
                , {x:350,y:240, radius:20}
            ).cast()
        this.b = new Point({x:390,y:220, radius:130})
        this.dragging.addPoints(...this.a, this.b)



    }

    draw(ctx){
        this.clear(ctx)

        /* hip leashes knee */
        // this.a[2].constraint.leash(this.a[1], 100)

        /* Knee leashes foot */
        // this.a[1].constraint.leash(this.a[0], 100)

        /* Knee looks away from hip*/
        let orig = this.a;
        let lineCurve = this.genLine(orig)
        // a1.pen.indicator(ctx)
        // this.a.pen.indicator(ctx, {color: 'cyan'})
        this.b.pen.indicator(ctx)
        orig.pen.indicator(ctx, {color: '#444'})
        // lineCurve.pen.indicator(ctx, {color: 'orange'})
        // orig[2].pen.indicator(ctx, {color: 'green'})
        // lineCurve.pen.quadCurve(ctx, {color: 'red', width: 2, loop:true})
        // lineCurve.pen.quadCurve(ctx, {color: 'pink', width: 2, loop:false})
        lineCurve.pen.line(ctx, {color: 'pink', width: 2, loop:false})
    }

    genLine(orig){

        let getPair = function(fromIndex=0, centerIndex=1, toIndex=2) {
            let r = orig[centerIndex].rotation

            orig[centerIndex].lookAt(orig[fromIndex])
            let a1 = orig[centerIndex].project()

            orig[centerIndex].lookAt(orig[toIndex])
            let a2 = orig[centerIndex].project()

            orig[centerIndex].rotation = r
            return [a1, a2]
        }

        const quadEaseOut = function(t) {
            return -(t * (t - 2))
        }

        const circularEaseInOut = function(t) {

            if( t < 0.5){
                return 0.5 * (1 - Math.sqrt(1 - 4 * (t * t)))
            }
            return 0.5 * (Math.sqrt(-((2 * t) - 3) * ((2 * t) - 1)) + 1)
        }


        let triple = function(fromIndex=0, centerIndex=1, toIndex=2, easingName) {
            let ab = getPair(fromIndex, centerIndex, toIndex)

            let c = orig[centerIndex].copy()
            c.lookAt(ab[0].midpoint(ab[1]))

            let real = c.radius - (ab[0].distanceTo(ab[1])) * .5
            if(easingName) {
                real = c.radius * easingFunctions[easingName][easingType](real / c.radius)
            }
            c = c.project(real)
            // return [ab[0], orig[centerIndex], ab[1]]
            return [ab[0], c, ab[1]]
        }

        let tipA = function(beforeIndex, index, toTip=true, easingName) {
            let origR = orig[index].rotation
            // orig[index].lookAt(orig.last())
            let a1 = orig[index].project()

            orig[index].lookAt(orig[beforeIndex])
            let a2 = orig[index]
            if(toTip) { a2 = a2.project() }
            orig[index].rotation = origR

            if(!toTip)  { return [a2, orig[index]] }
            let c = orig[index].copy()
            if(easingName) {
                c.lookAt(a1.midpoint(a2))
                let real = c.radius - (a1.distanceTo(a2)) * .5
                real = c.radius * easingFunctions[easingName][easingType](real / c.radius)
                c = c.project(real)
            }
            return [a1, c, a2]
        }

        let tipB = function(beforeIndex, index, toTip=true, easingName) {
            let origR = orig[index].rotation
            orig[index].lookAt(orig[beforeIndex])
            let a1 = orig[index]

            if(toTip) { a1 = a1.project() }
            orig[index].rotation = origR

            let a2 = orig[index].project()

            let c = orig[index].copy()
            if(easingName) {
                c.lookAt(a1.midpoint(a2))
                let real = c.radius - (a1.distanceTo(a2)) * .5
                real = c.radius * easingFunctions[easingName][easingType](real / c.radius)
                c = c.project(real)
            }
            if(!toTip)  { return [a1, orig[index]] }

            return [a1, c, a2]
        }

        let items = orig//.slice(1, stage.a.length-1)
        let toTip = true;
        let easingName = 'sine'
        let easingType = 'out'
        // orig[1].constraint.cone(orig[2], 90)
        let lineCurve = new PointList(
                ...tipA(1, 0, toTip, easingName)
                // , ...triple(0, 1, 2)
                // , ...triple(1, 2, 3)
                // , ...triple(2, 3, 4)
                // , ...tipB(3, 4, toTip)

            ).cast()


        items.forEach((e,i, a) => {
            if(i == 0 || i == items.length-1) { return }
            lineCurve.push(...triple(i-1, i, i+1, easingName))

        })

        lineCurve.push(...tipB(items.length-2, items.length-1, toTip, easingName));

        return lineCurve
    }
}


;stage = MainStage.go();