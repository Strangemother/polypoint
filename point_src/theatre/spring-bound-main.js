const applySpringForce = function(pointA, pointB, restLength, springConstant, dampingFactor) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the force exerted by the spring
    const forceMagnitude = springConstant * (distance - restLength);

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

const restLength = 100;
const springConstant = 0.6;
const dampingFactor = 0.97; // Adjust this value between 0 and 1


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


const applySpringForceDistributed = function(pointA, pointB, restLength, springConstant, dampingFactor, lockedPoints = new Set()) {
    // Calculate the distance between pointA and pointB
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the force exerted by the spring
    const forceMagnitude = springConstant * (distance - restLength);

    // Calculate the direction of the force
    const fx = (dx / distance) * forceMagnitude;
    const fy = (dy / distance) * forceMagnitude;

    let aLocked = lockedPoints.has(pointA)
    let bLocked = lockedPoints.has(pointB)

    let noLock = !aLocked && !bLocked
    let aSideLock = aLocked && !bLocked
    let bSideLock = !aLocked && bLocked

    // Distribute the force to non-locked points
    if (noLock) {
        pointA.vx -= fx / pointA.mass;
        pointA.vy -= fy / pointA.mass;
        pointB.vx += fx / pointB.mass;
        pointB.vy += fy / pointB.mass;
    } else if (aSideLock) {
        pointB.vx += fx / pointB.mass;
        pointB.vy += fy / pointB.mass;
    } else if (bSideLock) {
        pointA.vx -= fx / pointA.mass;
        pointA.vy -= fy / pointA.mass;
    }

    // Apply damping to reduce oscillation
    if (!aLocked) {
        pointA.vx *= dampingFactor;
        pointA.vy *= dampingFactor;
    }

    if (!bLocked) {
        pointB.vx *= dampingFactor;
        pointB.vy *= dampingFactor;
    }

    // Update positions based on velocities
    if (!aLocked) {
        pointA.x += pointA.vx;
        pointA.y += pointA.vy;
    }

    if (!bLocked) {
        pointB.x += pointB.vx;
        pointB.y += pointB.vy;
    }
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 150, y: 230
                , radius: 10
                , vx: 1, vy: 0
                , mass: 10
            })
            , new Point({
                 x: 350, y: 200
                , vx: -1, vy: 0
                , radius: 10
                , mass: 10
            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
            // , new Point({
            //      x: 450, y: 520
            //     , vx: .4, vy: -.1
            //     , radius: 8
            //     , mass: 8
            // })
            // , new Point({
            //      x: 450, y: 520
            //     , vx: .4, vy: -.1
            //     , radius: 8
            //     , mass: 8
            // })
            // , new Point({
            //      x: 450, y: 520
            //     , vx: .4, vy: -.1
            //     , radius: 8
            //     , mass: 8
            // })
        )
    }

    draw(ctx){
        this.clear(ctx)

        let mouse = Point.mouse.position
        let ps = this.points;
        const lockedPoints = new Set([ps[0]]); // Lock pointA in place

        applySpringForceDistributed(ps[0], ps[1], restLength, springConstant, dampingFactor, lockedPoints);
        applySpringForceDistributed(ps[1], ps[2], restLength, springConstant, dampingFactor, lockedPoints);
        applySpringForceDistributed(ps[2], ps[0], restLength, springConstant, dampingFactor, lockedPoints);

        // this.points.last().rotation += 2
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
