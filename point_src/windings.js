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
        this.prevCache = 0// point.rotation
        this.lastDiff = 0
    }

    calculate(point=this.parent) {
        let initRad = this.initRad
        point = point || this.parent

        // if(initRad == undefined) {
        //     initRad = point.radians
        // };
        let lro = {radians:initRad};
        let rotW = calculateAngleDiffWrapped(lro, point)
        let rot = calculateAngleDiff(lro, point)
        if(rot != this.prevCache) {
            // console.log(rot, this.initRad)
            let diff = (this.prevCache - rot)
            if (diff < -180 || diff > 180) {
                // skip it.
                diff = ((this.prevCache - 360) % 360 ) + rot
            } else {
                this.total += diff;
            }
            this.lastDiff = diff
        }

        this.prevCache = rot
        this.initRad = initRad
        return this.total
    }


}


Polypoint.head.deferredProp('Point', function windings() {
        return new PointWinding(this)
    }
)