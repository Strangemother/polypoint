const applySpringForce = function(pointA, pointB, restLength, springConstant, dampingFactor) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the force exerted by the spring
    const forceMagnitude = (springConstant * (distance - restLength))

    // Calculate the direction of the force
    const fx = (dx / distance) * forceMagnitude;
    const fy = (dy / distance) * forceMagnitude;

    // Apply the force to pointA and pointB
    pointA.vx -= fx / pointA.mass;
    pointA.vy -= fy / pointA.mass;
    pointB.vx += fx / pointB.mass;
    pointB.vy += fy / pointB.mass;

    // Apply damping to reduce oscillation
    pointA.vx *= dampingFactor;
    pointA.vy *= dampingFactor;
    pointB.vx *= dampingFactor;
    pointB.vy *= dampingFactor;

    // Update positions based on velocities
    pointA.x += pointA.vx;
    pointA.y += pointA.vy;
    pointB.x += pointB.vx;
    pointB.y += pointB.vy;
}


const applySpringForceLocking = function(pointA, pointB, restLength, springConstant, dampingFactor, lockedPoints = new Set()) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the force exerted by the spring
    const forceMagnitude = springConstant * (distance - restLength);

    // Calculate the direction of the force
    const fx = (dx / distance) * forceMagnitude;
    const fy = (dy / distance) * forceMagnitude;

    // Apply the force to pointA and pointB, only if they are not locked
    if (!lockedPoints.has(pointA)) {
        pointA.vx -= fx / pointA.mass;
        pointA.vy -= fy / pointA.mass;
    }
    if (!lockedPoints.has(pointB)) {
        pointB.vx += fx / pointB.mass;
        pointB.vy += fy / pointB.mass;
    }

    // Apply damping to reduce oscillation
    if (!lockedPoints.has(pointA)) {
        pointA.vx *= dampingFactor;
        pointA.vy *= dampingFactor;
    }
    if (!lockedPoints.has(pointB)) {
        pointB.vx *= dampingFactor;
        pointB.vy *= dampingFactor;
    }

    // Update positions based on velocities
    if (!lockedPoints.has(pointA)) {
        pointA.x += pointA.vx;
        pointA.y += pointA.vy;
    }
    if (!lockedPoints.has(pointB)) {
        pointB.x += pointB.vx;
        pointB.y += pointB.vy;
    }
}

const applySpringForceDistributed = function()  {
        return applySpringForceDistributedWithTime.apply(this, arguments)
}

const applySpringForceDistributedWithTime = function(pointA, pointB, restLength,
    springConstant, dampingFactor, lockedPoints = new Set(), deltaTime = 1) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the force exerted by the spring
    const forceMagnitude = springConstant * (distance - restLength);

    // Calculate the direction of the force
    const fx = ((dx / distance) * forceMagnitude);
    const fy = ((dy / distance) * forceMagnitude);

    let aLocked = lockedPoints.has(pointA);
    let bLocked = lockedPoints.has(pointB);

    let noLock = !aLocked && !bLocked;
    let aSideLock = aLocked && !bLocked;
    let bSideLock = !aLocked && bLocked;

    // Distribute the force to non-locked points
    if (noLock) {
        pointA.vx -= (fx / pointA.mass) * deltaTime;
        pointA.vy -= (fy / pointA.mass) * deltaTime;
        pointB.vx += (fx / pointB.mass) * deltaTime;
        pointB.vy += (fy / pointB.mass) * deltaTime;
    } else if (aSideLock) {
        pointB.vx += (fx / pointB.mass) * deltaTime;
        pointB.vy += (fy / pointB.mass) * deltaTime;
    } else if (bSideLock) {
        pointA.vx -= (fx / pointA.mass) * deltaTime;
        pointA.vy -= (fy / pointA.mass) * deltaTime;
    }

    // Apply damping to reduce oscillation
    if (!aLocked) {
        pointA.vx *= Math.pow(dampingFactor, deltaTime);
        pointA.vy *= Math.pow(dampingFactor, deltaTime);
    }

    if (!bLocked) {
        pointB.vx *= Math.pow(dampingFactor, deltaTime);
        pointB.vy *= Math.pow(dampingFactor, deltaTime);
    }

    // Update positions based on velocities
    if (!aLocked) {
        pointA.x += pointA.vx * deltaTime;
        pointA.y += pointA.vy * deltaTime;
    }

    if (!bLocked) {
        pointB.x += pointB.vx * deltaTime;
        pointB.y += pointB.vy * deltaTime;
    }
}


class PointSpring {
    constructor(point) {
        this.parent = point
    }

    to(other, restLength, springConstant=.6, dampingFactor=.99, lockedPoints=new Set, deltaTime=1) {
        return applySpringForceDistributedWithTime(this.parent, other,
             restLength, springConstant, dampingFactor, lockedPoints, deltaTime);
    }
}


class PointListSpring {
    /* An extension to the PointList for 'springs' */

    restLength = 100
    springConstant = .6
    dampingFactor = 0.92 // Adjust this value between 0 and 1
    deltaTime = .9

    constructor(pointList) {
        this.parent = pointList
    }

    chain(rLen=this.restLength,
        springConstant=this.springConstant,
        damping=this.damping,
        lockedPoints=this.lockedPoints,
        deltaTime=this.deltaTime) {
        /* Connect from tip to tip without connecting the first to the last. */
        let ps = this.parent
        let previous = ps[0]
        for (var i = 1; i < ps.length; i++) {
            let current = ps[i]
            previous.spring.to(current, rLen, springConstant, damping, lockedPoints, deltaTime)
            previous = current
        }
    }

    closedChain() {
        return this.loop.apply(this, arguments)
    }

    loop(rLen=this.restLength,
        springConstant=this.springConstant,
        damping=this.damping,
        lockedPoints=this.lockedPoints,
        deltaTime=this.deltaTime) {

        let ps = this.parent
        this.chain.apply(this, arguments)
        ps.last().spring.to(ps[0], rLen, springConstant, damping, lockedPoints, deltaTime)
    }

}


Polypoint.head.deferredProp('PointList', function() {
        return new PointListSpring(this)
    }, 'spring')


Polypoint.head.lazyProp('Point', {
    spring() {
        let r = this._spring
        if(r == undefined) {
            r = new PointSpring(this)
            this._spring = r
        }

        return r
    }
})
