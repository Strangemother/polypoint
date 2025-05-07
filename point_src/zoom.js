/*
---
title: Zoom
category: zoom
    scale
---

Scale a set of points in a _zooming_ method, relative to an `origin` point.

Apply a set of points to an instance of `Zoom`, then apply an update().

    const zoom = new Zoom(stage, pointList)

    const origin = {x: 100, y: 100}
        , factor = 1.5 // 50% bigger.

    // run `update` when a change occurs.
    zoom.update(origin, factor)

    // Draw points.
    zoom.zoomPoints.pen.indicators(ctx, { color: 'gray', width: 1})
 */

class Zoom {
    constructor(stage, points=[], factor=1, center={x:0, y:0}) {
        this.stage = stage
        this.points = points
        this.factor = factor
        this.center = center
        this._cachePoints = new PointList
    }

    add(...points) {
        this.points = this.points.concat(points)
    }

    update(center=this.center, factor=this.factor) {
        // move and scale all items relative to the factor and center.
        let zoomPoints = this.getZoomPoints()
        let originPoints = this.points
        originPoints.forEach((originPoint,i,a)=>{
            let sibling = zoomPoints[i]
            // the xy is a scale of the origin distance from the center
            let dis = originPoint.distance2D(center)

            // let offs = {x: 20, y: 20 } // originPoint.distance2D(center)

            sibling.update({
                x: center.x + (dis.x * factor)
                , y: center.y + (dis.y * factor)
                , radius: originPoint.radius * factor
                , rotation: originPoint.rotation

                // x: originPoint.x + (dis.x * factor)
                // , y: originPoint.y + (dis.y * factor)
                // , radius: originPoint.radius * (1+factor)
                // , rotation: originPoint.rotation
            })
        })
    }

    get zoomPoints() {
        if(this._zoomPoints) {
            return this._zoomPoints
        }

        return this._cachePoints;
    }

    getZoomPoints() {
        if(this._zoomPoints) {
            return this._zoomPoints
        }

        let zoomPoints = this._cachePoints
        this.points.forEach((e,i,a)=>{
            zoomPoints.push(e.copy())
        })

        this._zoomPoints = zoomPoints
        return zoomPoints
    }
}
