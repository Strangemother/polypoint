
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


const stringAttach = function(followPoint, originPoint, settings) {
    // Apply gravity to the follow point's vertical velocity
    // Calculate the vector from the originPoint to the follow point
    // let dx = followPoint.x - originPoint.x ;
    // let dy = followPoint.y - originPoint.y ;
    const defaultSettings = {
        gravity: {x:0, y:1}
        , damping:.95
        , dotDamping:.2
        , forceMultiplier:.1
        , forceValue:undefined
        , distance: 100
    }

    const conf = Object.assign(defaultSettings, settings);

    const gravity = conf.gravity
        , damping = conf.damping
        , dotDamping = conf.dotDamping
        , forceMultiplier = conf.forceMultiplier
        , forceValue = conf.forceValue
        , stringLength = conf.distance
        ;

    let dx = originPoint.x - followPoint.x;
    let dy = originPoint.y - followPoint.y;

    // Calculate the current distance between the follow point and the originPoint
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Set the follow point's position to be exactly on the circumference of the string length
    // const force = (distance - stringLength) * 0.01; // Tweak this factor as needed

    // If the distance exceeds the string length, we need to constrain the follow point
    if (distance > stringLength) {

        // Normalize the direction vector
        dx /= distance;
        dy /= distance;

        if(dotDamping!==false) {
            // Adjust the velocity so that it reflects the string tension
            let dotProduct = (followPoint.vx * dx + followPoint.vy * dy) * dotDamping;
            followPoint.vx -= dotProduct * dx;
            followPoint.vy -= dotProduct * dy;
        }

        if(forceMultiplier!==false){
            const force = forceValue? forceValue: (distance - stringLength) * forceMultiplier; // Tweak this factor as needed
            followPoint.vx += force * dx;
            followPoint.vy += force * dy;
        }

    }

    // Apply gravity
    if(gravity){
        followPoint.vy += gravity.y;
        followPoint.vx += gravity.x;
    }

    // Update the follow point's position based on its velocity
    followPoint.x += followPoint.vx;
    followPoint.y += followPoint.vy;

    if(damping) {
        // Apply damping continuously to smooth the motion
        followPoint.vx *= damping;
        followPoint.vy *= damping;
    }
};


class PointConstraints {


    constructor(point) {
        this.parent = point
        /* string stuff */
        this.gravity = {x:0, y:1}
        this.damping =.95
        this.dotDamping =.2
        this.forceMultiplier =.1
        this.forceValue =undefined
        this.distance = 100
    }

    /* Track another point using IK - this point follows the _other_ at a
    set distance. */
    track(other, settings) {
        // return followPoint(other, this, settings)
        return constraints.distance(other, this.parent, settings)
    }

    /* Track another point using constraints. This point follows the other
    point at a distance or less. */
    leash(other, settings) {
        return constraints.within(other, this.parent, settings)
    }

    /* Ensure this point does not overlap the _other_ point. If an overlap
    occurs, this point is moved. Fundamentally this is the antethsis of leash().*/
    avoid(other, settings) {
        return constraints.inverse(other, this.parent, settings)
    }

    elbow(other, settings){
        /* Connect this point and another point by their _edges_. Similar to
        _track_ at a distance, but accounting for radius. */
        let point = this.parent;
        /* Ensure a point stays within a distance. */
        this.leash(other, (other.radius + point.radius) - .01)
        /* Ensure the point binds to the edge of the target. */
        this.avoid(other, Math.abs(other.radius - point.radius) + .01)
    }

    string(other, settings){
        // Manipulate the _other_; with this entity as the origin owner.
        const c = Object.assign({
            gravity: this.gravity
            , damping: this.damping
            , dotDamping: this.dotDamping
            , forceMultiplier: this.forceMultiplier
            , forceValue: this.forceValue
            , distance: this.distance
        }, settings)
        return stringAttach(other, this.parent, c)
    }
}

Polypoint.head.deferredProp('Point',
    function constraint() {
        return new PointConstraints(this)
    }
);


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
