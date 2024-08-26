
const constraints = {
    lte: (a, b) => a <= b
    , gt: (a, b) => a > b
    , any: (a, b) => true

    , _ifDistance: function(pointA, pointB, maxDistance, action=gt) {
        const d2d = pointA.distance2D(pointB)
            , distance = d2d.distance
            , r = action(distance, maxDistance)
            ;

        if(r) {
            /* Same as:

            const ratio = maxDistance / distance;
                pointB.x = pointA.x - d2d.x * ratio;
                pointB.y = pointA.y - d2d.y * ratio;
            */
            let t = pointA.subtract(
                    Point.from(d2d).multiply(maxDistance / distance)
                )
            pointB.copy(t)
        };
        return r
    }

    , distance(pointA, pointB, maxDistance) {
        return this._ifDistance(pointA, pointB, maxDistance, this.any)
    }

    , within(pointA, pointB, maxDistance) {
        return this._ifDistance(pointA, pointB, maxDistance, this.gt)
    }

    , inverse(pointA, pointB, maxDistance) {
        /*
            If the distance between A and B is greater than the given max distance,
            move point B away from point A.

            Or; Point B _avoids_ point A.
         */
        return this._ifDistance(pointA, pointB, maxDistance, this.lte)
    }

}


Polypoint.head.installFunctions('Point', {
    /* Track another point using IK - this point follows the _other_ at a
    set distance. */
    track(other, settings) {
        // return followPoint(other, this, settings)
        return constraints.distance(other, this, settings)
    }

    /* Track another point using constraints. This point follows the other
    point at a distance or less. */
    , leash(other, settings) {
        return constraints.within(other, this, settings)
    }

    /* Ensure this point does not overlap the _other_ point. If an overlap
    occurs, this point is moved. Fundamentally this is the antethsis of leash().*/
    , avoid(other, settings) {
        return constraints.inverse(other, this, settings)
    }
})


// const _constrainDistance = function(pointA, pointB, maxDistance) {
//     // Calculate the distance between pointA and pointB
//     // const dx = pointA.x - pointB.x;
//     // const dy = pointA.y - pointB.y;
//     // const distance = Math.sqrt(dx * dx + dy * dy);
//     const distance = pointA.distanceTo(pointB)
//     const distance2D = pointA.distance2D(pointB)

//     if(gt(distance, maxDistance)) {
//         // const constrainedX = pointA.x - dx * ratio;
//         // const constrainedY = pointA.y - dy * ratio;
//         const ratio = maxDistance / distance;
//         const constrainedX = pointA.x - distance2D.x * ratio;
//         const constrainedY = pointA.y - distance2D.y * ratio;
//         pointB.x = constrainedX;
//         pointB.y = constrainedY;
//     }
// }


// const _inverseConstrainDistance = function(pointA, pointB, maxDistance) {
//     // Calculate the distance between pointA and pointB
//     const dx = pointA.x - pointB.x;
//     const dy = pointA.y - pointB.y;
//     // const distance = Math.sqrt(dx * dx + dy * dy);
//     const distance = pointA.distanceTo(pointB)
//     const distance2D = pointA.distance2D(pointB)

//     // If the distance is greater than the maxDistance, move pointB closer
//     if(lte(distance, maxDistance) ) {
//         const ratio = maxDistance / distance;
//         const constrainedX = pointA.x - distance2D.x * ratio;
//         const constrainedY = pointA.y - distance2D.y * ratio;
//         pointB.x = constrainedX;
//         pointB.y = constrainedY;
//     }
// }
