/*
---
title: Locked Joint
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point-content.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stagepen.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/constrain-distance.js
---

Given a point, project a cone from the center of the point, and limit the rotation of the point to a maximum angle value.

The point can be rotated around its center, but it cannot exceed the angle of the cone. 
The cone is defined by a rotation value and a cone angle. The rotation value determines the direction of the cone, and the cone angle determines how wide the cone is.
 */
class MainStage extends Stage {
    canvas='playspace'

    mounted(){

        let a = this.a = new Point({x:200,y:200, radius: 50, rotation: 10, cone: 50})

        this.dragging.add(a)

    }

    draw(ctx){
        this.clear(ctx)

        this.a.rotation += .2

        let conePoints = this.getConePoints(this.a)
        // draw cone by filling the polygon of the cone points
        conePoints.pen.fill(ctx, {color: 'rebeccapurple'})
        conePoints.draw.line(ctx)
        // conePoints.pen.fill(ctx, {color: 'undefined'})
        this.pen.fill(ctx, "#5f2260")
        this.a.pen.indicator(ctx, {color:'#ddd'})
        
    }

    getConePoints(point){
        let startAngle = point.rotation - point.cone
        let endAngle = point.rotation + point.cone
        let start = this.getWallIntersection(point, startAngle)
        let end = this.getWallIntersection(point, endAngle)
        let corners = this.getConeCorners(point, startAngle, endAngle)
        return new PointList(point.copy().update({radius: undefined}), start, ...corners, end).cast()
    }

    getConeCorners(point, startAngle, endAngle) {
        let { width, height } = this.dimensions
        let sweep = endAngle - startAngle
        let corners = [
            new Point({x: 0, y: 0})
            , new Point({x: width, y: 0})
            , new Point({x: width, y: height})
            , new Point({x: 0, y: height})
        ]

        return corners
            .filter((corner) => {
                let angle = this.angleTo(point, corner)
                let offset = this.wrapAngle(angle - startAngle)
                return offset > 0 && offset < sweep
            })
            .sort((a, b) => {
                let aAngle = this.wrapAngle(this.angleTo(point, a) - startAngle)
                let bAngle = this.wrapAngle(this.angleTo(point, b) - startAngle)
                return aAngle - bAngle
            })
    }

    getWallIntersection(point, angle) {
        let { width, height } = this.dimensions
        let radians = degToRad(angle)
        let dx = Math.cos(radians)
        let dy = Math.sin(radians)
        let hits = []

        if(dx > 0) {
            hits.push(this.hitAtX(point, width, dx, dy))
        }

        if(dx < 0) {
            hits.push(this.hitAtX(point, 0, dx, dy))
        }

        if(dy > 0) {
            hits.push(this.hitAtY(point, height, dx, dy))
        }

        if(dy < 0) {
            hits.push(this.hitAtY(point, 0, dx, dy))
        }

        return hits
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)[0]
    }

    hitAtX(point, wallX, dx, dy) {
        let distance = (wallX - point.x) / dx
        let y = point.y + (dy * distance)
        if(distance < 0 || y < 0 || y > this.dimensions.height) {
            return undefined
        }

        return new Point({x: wallX, y, distance})
    }

    hitAtY(point, wallY, dx, dy) {
        let distance = (wallY - point.y) / dy
        let x = point.x + (dx * distance)
        if(distance < 0 || x < 0 || x > this.dimensions.width) {
            return undefined
        }

        return new Point({x, y: wallY, distance})
    }

    angleTo(point, target) {
        return radiansToDegrees(Math.atan2(target.y - point.y, target.x - point.x))
    }

    wrapAngle(value) {
        return (value % 360 + 360) % 360
    }
}


;stage = MainStage.go();