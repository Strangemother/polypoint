/*A Bisect divides an angle or line segment into two equal parts.
Imagine you have two points connected by a line or forming an angle.
The bisector finds the exact middle, splitting the angle or the line
into two even halves.
*/

function bisectAll(items, direction='obtuse') {
    let func = obtuseBisect;
    if(['acute', 0].indexOf(direction) > -1) {
        func = acuteBisect
    }

    let l = items.length
    let lm1 = l-1
    let last = items[lm1]
    let first = items[0]
    // very first should rotated relative to [1] and [l-1]
    first.radians = func(first, items[0],  items[1])
    last.radians = func(items[lm1-1], last, first)

    for(let i = 1; i < items.length-1; i++) {
        let p = items[i]
        p.radians = func(items[i-1], p,  items[i+1])
    }
}


/* Rotate the midPoint to be the bisect of the pointA and pointC, pointing
in the _obtuse_ direction. */
function obtuseBisect(pointA, midPoint, pointC) {
    // const mag2d = calculateBisector(pointA, midPoint, pointC);
    // Spin for obtuse.
    return acuteBisect(pointA, midPoint, pointC) + Math.PI
}


function acuteBisect(pointA, midPoint, pointC) {
    const mag2d = calculateBisector(pointA, midPoint, pointC);
    /* To rotate the mid-point into the _obtuse_ direction,
    we generate a new point,
    adding the magnitude (the amount of 2D force)
    let the mid-point rotate to look-at the new point.
    Finally rotate*/
    return midPoint.directionTo(midPoint.add(mag2d))
}

function calculateBisector(pointA, midPoint, pointC, normalized=false) {
    /*
        // Example usage:
        const pointA = { x: 1, y: 1 };
        const midPoint = { x: 0, y: 0 };
        const pointC = { x: 1, y: 0 };

        const bisector = calculateBisector(pointA, midPoint, pointC);
        console.log(`Bisector direction: x=${bisector.x}, y=${bisector.y}`);
     */
    const normalizedAB = pointA.subtract(midPoint).normalized()
    const normalizedCB = pointC.subtract(midPoint).normalized()
    const bisector = normalizedAB.add(normalizedCB)

    if(!normalized) { return bisector }
    return bisector.normalized()
}

function rawCalculateBisector(pointA, pointB, pointC) {
    /*
        // Example usage:
        const pointA = { x: 1, y: 1 };
        const pointB = { x: 0, y: 0 };
        const pointC = { x: 1, y: 0 };

        const bisector = calculateBisector(pointA, pointB, pointC);
        console.log(`Bisector direction: x=${bisector.x}, y=${bisector.y}`);
     */
    // Vectors AB and CB
    const AB = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
    const CB = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };

    // Normalize the vectors
    const magnitudeAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
    const magnitudeCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
    const normalizedAB = { x: AB.x / magnitudeAB, y: AB.y / magnitudeAB };
    const normalizedCB = { x: CB.x / magnitudeCB, y: CB.y / magnitudeCB };

    // Calculate the bisector vector by summing the normalized vectors
    const bisector = {
        x: normalizedAB.x + normalizedCB.x,
        y: normalizedAB.y + normalizedCB.y
    };

    // Normalize the bisector vector to get the direction
    const magnitudeBisector = Math.sqrt(bisector.x * bisector.x + bisector.y * bisector.y);
    const normalizedBisector = {
        x: bisector.x / magnitudeBisector,
        y: bisector.y / magnitudeBisector
    };

    return normalizedBisector;
}


class PointBisect {
    /* Bisect tools for a single point */

}