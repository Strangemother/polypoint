/*
files: compass.js
 */
Math.PI2 = Math.PI * 2



// const isFunction = function(value) {
//     return (typeof(value) == 'function')
// }

// --
/* PolyGen v3.1 | MIT License | git.io/fjq8z */
const polyGen = function(ctx, count, point, radius) {

    let points = getPolyDistributedPoints(count, point, radius)
    let p0 = points[0]

    ctx.beginPath();

    ctx.moveTo(p0.x, p0.y)

    for (i = 1; i <= points.length - 1; i++) {
        let p = points[i]
        ctx.lineTo(p.x, p.y);
    }

}


const getPolyDistributedPoints = function(count, pos, radius, rads=0, angle) {
    /* Return a list of points distrubuted evenly around a circle.
     */
    radius = radius == undefined? pos.radius: radius;
    let {x, y} = pos.add(radius);

    let res = []

    const c2pi = Math.PI2 / count

    for (let i = 0; i < count; i++) {
        let i2pic = (i * c2pi) + rads;
        let p = point(
                x + radius * Math.cos(i2pic),
                y + radius * Math.sin(i2pic)
            );

        p.radians = i2pic + (angle == undefined? 0: angle)
        res.push(p)
    }

    return res
}


let centerOfMass = {
    simple(points, origin) {
        /* Synonymous to:

            let totalX = 0;
            let totalY = 0;
            let numPoints = points.length;

            for (let i = 0; i < numPoints; i++) {
                totalX += points[i].x;
                totalY += points[i].y;
            }

            let centerX = totalX / numPoints;
            let centerY = totalY / numPoints;

            return point(centerX, centerY);
         */
        let total = point(0,0)
        if(origin) total.add(origin);

        points.forEach((p) => {
            total = total.add(p)
        })

        return total.divide(points.length);
    }

    , deep(points, origin) {
        /* Synonymous to:

            let totalMass = 0;
            let weightedSumX = 0;
            let weightedSumY = 0;
            let weightedSumRotation = 0;

            for (let i = 0; i < points.length; i++) {
                let mass = points[i].mass;
                // let z = points[i].z
                totalMass += mass;
                weightedSumX += points[i].x * points[i].mass;
                weightedSumY += points[i].y * points[i].mass;
                // weightedSumZ += z * points[i].mass;
                const rotation = points[i].rotation
                weightedSumRotation += rotation * mass
            }


            let centerX = weightedSumX / totalMass;
            let centerY = weightedSumY / totalMass;
            let centerRotation = weightedSumRotation / totalMass;

            let _point = point(centerX, centerY);
            _point.mass = totalMass
            _point.radius = totalMass
            _point.rotation = centerRotation
            return _point

        */
        let totalMass = 0;
        let weightedSum = point(0,0)
        if(origin) weightedSum.add(origin);

        let weightedSumRotation = 0;

        points.forEach((p)=>{
            let mass = p.radius;

            totalMass += mass;
            weightedSum = weightedSum.add(p.multiply(mass))
            weightedSumRotation += p.rotation * mass
        })

        let center = weightedSum.divide(totalMass)

        center.rotation = weightedSumRotation / totalMass;
        center.radius = center.mass = totalMass

        return center
    }
}


function projectFrom(origin, distance=undefined, rotation=undefined) {
    // Convert rotation angle from degrees to radians
    if(rotation === undefined) {
        rotation = origin.rotation
    }

    if(distance === undefined) {
        distance = origin.radius
    }

    const rotationInRadians = degToRad(rotation)

    // Calculate the new x and y coordinates
    const x = origin.x + distance * Math.cos(rotationInRadians);
    const y = origin.y + distance * Math.sin(rotationInRadians);

    return { x, y };
}


class XAngle extends Number {

    constructor(value) {
        super(value)
    }

    protractorRotate(deg=180) {
        return adjustAngleToPreferredRotation(this, deg)
    }

    radToDeg() {
        /* Assume this is a radian value and convert to degrees. */
        return radiansToDegrees(this)
    }

}

