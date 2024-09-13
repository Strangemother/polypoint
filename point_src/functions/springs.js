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
