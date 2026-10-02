/*
---
title: Windings
category: windings
---

 */


function calculateAngleDiffWrapped(primaryPoint, secondaryPoint) {
    let rads = radiansDiff2(primaryPoint.radians, secondaryPoint.radians);
    return radiansToDegrees(rads);
}

function radiansDiff2(primaryRads, secondaryRads) {
    let diff = (primaryRads - secondaryRads + Math.PI) % (Math.PI * 2) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
}

class PointWinding {
    constructor(point) {
        this.parent = point;
        this.reset()
    }

    reset(point=this.parent) {
        this.total = point.rotation
        this.initRad = point.radians
        this.prevCache = point.radians
        this.lastDiff = 0
    }

    calculate(point=this.parent) {
        point = point || this.parent
        this.lastDiff = radiansToDegrees(radiansDiff2(point.radians, this.prevCache))
        this.total += this.lastDiff
        this.prevCache = point.radians
        return this.total
    }


}


Polypoint.head.deferredProp('Point', function windings() {
        return new PointWinding(this)
    }
)