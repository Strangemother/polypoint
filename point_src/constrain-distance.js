
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
