/*
title: Limited Projection
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/relative.js
    ../point_src/automouse.js




class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 10, this.compass.right)
        this.limitPoint = new Point(500, 200, 10, this.compass.up)
        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)
        this.limitPoint.pen.indicator(ctx)
    }
}

stage = MainStage.go()
*/

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.point = new Point(350, 300, 10, this.compass.right)
        this.limitPointA = new Point(100, 100, 10, this.compass.up + 90)
        this.limitPointB = new Point(700, 100, 10, this.compass.up + -10)
        this.dragging.add(this.point, this.limitPointA, this.limitPointB)
    }

    draw(ctx) {
        this.clear(ctx)
        this.point.lookAt(this.mouse.position)
        this.point.pen.indicator(ctx)
        this.limitPointA.pen.indicator(ctx)
        this.limitPointB.pen.indicator(ctx)

        // Calculate the endpoint of the projected line
        let endPoint = this.calculateLineEndpoint(
            this.point,
            this.limitPointA
        )

        if(endPoint == Infinity) {
            /* reverse direction projected inverse to the stage edge.*/
            // endPoint = this.point.project(100)
            // endPoint = this.calculateLineEndpoint(
            //     this.point,
            //     {x:800, y:800}
            // )
            endPoint = this.calculateLineEndpoint(
                this.point,
                this.limitPointB
            )
        }

        // Draw the projected line
        ctx.beginPath()
        ctx.moveTo(this.point.x, this.point.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.strokeStyle = 'yellow'
        ctx.stroke()
    }

    calculateLineEndpoint(a, b) {
        let [x0, y0, theta0] = [a.x, a.y, a.radians]
        let [limitX, limitY, thetaLim] = [b.x, b.y, b.radians]
        const cosTheta0 = Math.cos(theta0)
        const sinTheta0 = Math.sin(theta0)
        const cosThetaLim = Math.cos(thetaLim)
        const sinThetaLim = Math.sin(thetaLim)
        let D = sinTheta0 * cosThetaLim - cosTheta0 * sinThetaLim

        if (Math.abs(D) < 1e-10) {
            return Infinity // Lines are parallel; no intersection
        }

        let t1 = ((limitY - y0) * cosThetaLim - (limitX - x0) * sinThetaLim) / D

        if (t1 < 0) {
            return Infinity
        }

        const x = x0 + t1 * cosTheta0
        const y = y0 + t1 * sinTheta0

        return { x, y }
    }
}

stage = MainStage.go()


class X {
    a_calculateLineEndpoint(a, b) {
        let [x0, y0, theta0] = [a.x, a.y, a.radians]
        let [limitX, limitY, thetaLim] = [b.x, b.y, b.radians]
        const cosTheta = Math.cos(theta0)
        const sinTheta = Math.sin(theta0)
        let tValues = []

        // Initialize t to Infinity
        let t = Infinity

        // Compute t for intersection with the right edge (x = limitX)
        if (cosTheta !== 0) {
            const tRight = (limitX - x0) / cosTheta
            if (tRight >= 0 && tRight < t) {
                t = tRight
            }
        }

        // Compute t for intersection with the top edge (y = limitY)
        // if (sinTheta !== 0) {
        //     const tTop = (limitY - y0) / sinTheta
        //     if (tTop >= 0 && tTop < t) {
        //         t = tTop
        //     }
        // }

        // If t is still Infinity, the line does not intersect within the limits
        if (t === Infinity) {
            return Infinity//{ x: x0, y: y0 }
        }

        // Calculate the endpoint coordinates
        const x = x0 + t * cosTheta
        const y = y0 + t * sinTheta

        return { x, y }
    }
}

