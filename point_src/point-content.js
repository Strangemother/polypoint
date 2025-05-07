/*
files:
    compass.js
    center.js
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
