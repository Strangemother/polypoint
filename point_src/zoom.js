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
    constructor(stage, points=[], factor=1, center={x:0, y:0}, lens=0) {
        this.stage = stage
        this.points = points
        this.factor = factor
        this.lens = lens
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
        let lens = this.lens
        originPoints.forEach((originPoint,i,a)=>{
            let sibling = zoomPoints[i]
            // the xy is a scale of the origin distance from the center
            let dis = originPoint.distance2D(center)

            // let offs = {x: 20, y: 20 } // originPoint.distance2D(center)

            sibling.update({
                x: center.x + (dis.x * factor * lens)
                , y: center.y + (dis.y * factor * lens)
                , radius: originPoint.radius * factor * lens
                , rotation: originPoint.rotation

                // x: originPoint.x + (dis.x * factor)
                // , y: originPoint.y + (dis.y * factor)
                // , radius: originPoint.radius * (1+factor)
                // , rotation: originPoint.rotation
            })
        })
    }

    update(center = this.center, factor = this.factor) {
        // Lensed zoom: farther points move disproportionately more.
        const zoomPoints   = this.getZoomPoints()
        const originPoints = this.points
        const lensStrength = this.lens      // e.g. 0.0 = off, 0.3 = subtle, 1.0 = chunky

        // 1) Find max radius to normalize distances (so lensing is consistent).
        let maxR = 0
        for (let i = 0; i < originPoints.length; i++) {
            const p = originPoints[i]
            const dx = p.x - center.x
            const dy = p.y - center.y
            const r  = Math.hypot(dx, dy)
            if (r > maxR) maxR = r
        }
        // Avoid div by zero if all points are at the center.
        if (maxR === 0) maxR = 1

        // 2) Apply lens curve per point.
        for (let i = 0; i < originPoints.length; i++) {
            const originPoint = originPoints[i]
            const sibling     = zoomPoints[i]

            const dx = originPoint.x - center.x
            const dy = originPoint.y - center.y
            const r  = Math.hypot(dx, dy)
            const t  = r / maxR                   // normalized radius [0..1]

            // Quadratic barrel curve: 1 + k * t^2  (k = lensStrength)
            //  - k > 0 pushes far points further (barrel)
            //  - k < 0 pulls far points in (pincushion)
            const lensCurve = 1 + (lensStrength * t * t)

            const s = factor * lensCurve          // total scale for displacement & radius

            sibling.update({
                x: center.x + dx * s,
                y: center.y + dy * s,
                radius: originPoint.radius * s,
                rotation: originPoint.rotation
            })
        }
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
