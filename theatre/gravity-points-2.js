/*
title: Gravity Points 2
categories: gravity
    raw
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/setunset.js
    ../point_src/stroke.js
 */
/* moved to functions/gravity */
const applyGravityAndBounds = function(point, gravityVector, bounds, dampingFactor) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Check for collision with bounds and bounce
    if (point.x <= bounds.left) {
        point.x = bounds.left;
        point.vx = -point.vx * dampingFactor;
    }
    if (point.x >= bounds.right) {
        point.x = bounds.right;
        point.vx = -point.vx * dampingFactor;
    }
    if (point.y <= bounds.top) {
        point.y = bounds.top;
        point.vy = -point.vy * dampingFactor;
    }
    if (point.y >= bounds.bottom) {
        point.y = bounds.bottom;
        point.vy = -point.vy * dampingFactor;
    }
}

const applyGravityAndBoundsAngular0 = function(point, gravityVector, bounds, dampingFactor) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Check for collision with bounds and bounce
    if (point.x <= bounds.left) {
        point.x = bounds.left;
        point.vx = -point.vx * dampingFactor;
        point.omega += Math.abs(point.vy) / point.radius; // Increase angular velocity based on y-velocity
    }
    if (point.x >= bounds.right) {
        point.x = bounds.right;
        point.vx = -point.vx * dampingFactor;
        point.omega -= Math.abs(point.vy) / point.radius; // Decrease angular velocity based on y-velocity
    }
    if (point.y <= bounds.top) {
        point.y = bounds.top;
        point.vy = -point.vy * dampingFactor;
        point.omega += Math.abs(point.vx) / point.radius; // Increase angular velocity based on x-velocity
    }
    if (point.y >= bounds.bottom) {
        point.y = bounds.bottom;
        point.vy = -point.vy * dampingFactor;
        point.omega -= Math.abs(point.vx) / point.radius; // Decrease angular velocity based on x-velocity
    }

    // Apply damping to reduce angular velocity over time
    point.omega *= dampingFactor;

    // Update rotation based on angular velocity
    point.rotation += radiansToDegrees(point.omega)
}

const applyGravityAndBoundsAngular1 = function(point, gravityVector, bounds, linearDampingFactor, angularDampingFactor, friction) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Check for collision with bounds and bounce
    if (point.x <= bounds.left) {
        point.x = bounds.left;
        point.vx = -point.vx * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vy / point.radius) * friction;

    }

    if (point.x >= bounds.right) {
        point.x = bounds.right;
        point.vx = -point.vx * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega -= (point.vy / point.radius) * friction;

    }
    if (point.y <= bounds.top) {
        point.y = bounds.top;
        point.vy = -point.vy * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vx / point.radius) * friction;

    }
    if (point.y >= bounds.bottom) {
        point.y = bounds.bottom;
        point.vy = -point.vy * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vx / point.radius) * friction;

    }

    // Apply damping to reduce angular velocity over time
    point.omega *= angularDampingFactor;

    // Update rotation based on angular velocity
    point.rotation += radiansToDegrees(point.omega);
}

const applyGravityAndBoundsAngularWithRadius = function(point, gravityVector, bounds, restitution=0.9, friction=0.7) {
    const radius = point.radius;
    const mass = point.mass > 0 ? point.mass : 1;
    const inertia = point.I > 0 ? point.I : 0.5 * mass * radius * radius;
    const bounciness = Number.isFinite(point.bounciness)
        ? Math.max(0, Math.min(1, point.bounciness))
        : restitution;
    const surfaceFriction = Number.isFinite(point.friction)
        ? Math.max(0, point.friction)
        : friction;
    point.omega = Number.isFinite(point.omega) ? point.omega : 0;

    point.vx += gravityVector.x;
    point.vy += gravityVector.y;
    point.x += point.vx;
    point.y += point.vy;

    const resolveWall = (normalX, normalY) => {
        const normalSpeed = point.vx * normalX + point.vy * normalY;
        if (normalSpeed <= 0) return;

        const bounce = normalSpeed < 1 ? 0 : bounciness;
        const normalImpulse = mass * normalSpeed * (1 + bounce);
        point.vx -= normalX * normalSpeed * (1 + bounce);
        point.vy -= normalY * normalSpeed * (1 + bounce);

        const contactX = normalX * radius;
        const contactY = normalY * radius;
        const tangentX = -normalY;
        const tangentY = normalX;
        const tangentSpeed =
            (point.vx - point.omega * contactY) * tangentX +
            (point.vy + point.omega * contactX) * tangentY;
        const inverseEffectiveMass = 1 / mass + radius * radius / inertia;
        const maxFrictionImpulse = surfaceFriction * normalImpulse;
        const frictionImpulse = Math.max(
            -maxFrictionImpulse,
            Math.min(maxFrictionImpulse, -tangentSpeed / inverseEffectiveMass)
        );

        const impulseX = tangentX * frictionImpulse;
        const impulseY = tangentY * frictionImpulse;
        point.vx += impulseX / mass;
        point.vy += impulseY / mass;
        point.omega += (contactX * impulseY - contactY * impulseX) / inertia;
    };

    if (point.x - radius < bounds.left) {
        point.x = bounds.left + radius;
        resolveWall(-1, 0);
    }
    if (point.x + radius > bounds.right) {
        point.x = bounds.right - radius;
        resolveWall(1, 0);
    }
    if (point.y - radius < bounds.top) {
        point.y = bounds.top + radius;
        resolveWall(0, -1);
    }
    if (point.y + radius > bounds.bottom) {
        point.y = bounds.bottom - radius;
        resolveWall(0, 1);
    }

    point.rotation += radiansToDegrees(point.omega);
}


const applyGravityAndBoundsAngular15 = function(point, gravityVector, bounds, linearDampingFactor, angularDampingFactor, rollingFriction) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Calculate tangential velocity based on angular velocity
    const tangentialVelocity = point.omega * point.radius;

    // Check for collision with bounds and bounce
    if (point.x - point.radius <= bounds.left) {
        point.x = bounds.left + point.radius;
        point.vx = -point.vx * linearDampingFactor;

        // Apply friction and adjust angular velocity
        point.vy += tangentialVelocity * rollingFriction;
        point.omega -= (point.vy / point.radius) * rollingFriction;
    }
    if (point.x + point.radius >= bounds.right) {
        point.x = bounds.right - point.radius;
        point.vx = -point.vx * linearDampingFactor;

        // Apply friction and adjust angular velocity
        point.vy -= tangentialVelocity * rollingFriction;
        point.omega += (point.vy / point.radius) * rollingFriction;
    }
    if (point.y - point.radius <= bounds.top) {
        point.y = bounds.top + point.radius;
        point.vy = -point.vy * linearDampingFactor;

        // Apply friction and adjust angular velocity
        point.vx += tangentialVelocity * rollingFriction;
        point.omega -= (point.vx / point.radius) * rollingFriction;
    }
    if (point.y + point.radius >= bounds.bottom) {
        point.y = bounds.bottom - point.radius;
        point.vy = -point.vy * linearDampingFactor;

        // Apply friction and adjust angular velocity
        point.vx -= tangentialVelocity * rollingFriction;
        point.omega += (point.vx / point.radius) * rollingFriction;
    }

    // Apply angular damping to reduce angular velocity over time
    point.omega *= angularDampingFactor;

    // Apply linear damping to reduce linear velocity over time
    point.vx *= linearDampingFactor;
    point.vy *= linearDampingFactor;

    // Threshold to stop small movements
    const threshold = 0.01;
    if (Math.abs(point.vx) < threshold) point.vx = 0;
    if (Math.abs(point.vy) < threshold) point.vy = 0;
    if (Math.abs(point.omega) < threshold) point.omega = 0;

    // Update rotation based on angular velocity
    point.rotation += radiansToDegrees(point.omega);
}


const applyGravityAndBoundsAngular2 = function(point, gravityVector, bounds, linearDampingFactor, angularDampingFactor, friction) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Check for collision with bounds and bounce
    if (point.x <= bounds.left) {
        point.x = bounds.left;
        point.vx = -point.vx * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        const tangentialVelocity = point.vy;
        point.omega += (tangentialVelocity / point.radius) * friction;

    }
    if (point.x >= bounds.right) {
        point.x = bounds.right;
        point.vx = -point.vx * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        const tangentialVelocity = point.vy;
        point.omega -= (tangentialVelocity / point.radius) * friction;

    }
    if (point.y <= bounds.top) {
        point.y = bounds.top;
        point.vy = -point.vy * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        const tangentialVelocity = point.vx;
        point.omega -= (tangentialVelocity / point.radius) * friction;  // Corrected to maintain consistent rotation direction

    }
    if (point.y >= bounds.bottom) {
        point.y = bounds.bottom;
        point.vy = -point.vy * linearDampingFactor;

        // Apply tangential velocity and adjust angular velocity
        const tangentialVelocity = point.vx;
        point.omega += (tangentialVelocity / point.radius) * friction;  // Corrected to maintain consistent rotation direction

    }

    // Apply angular damping to reduce angular velocity over time
    point.omega *= angularDampingFactor;

    // Update rotation based on angular velocity
    point.rotation += radiansToDegrees(point.omega);
}

const applyGravityAndBoundsAngular = function(point, gravityVector, bounds, linearDampingFactor, angularDampingFactor, friction) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Calculate tangential velocity based on angular velocity
    const tangentialVelocity = point.omega * point.radius;

    // Check for collision with bounds and bounce
    if (point.x <= bounds.left) {
        point.x = bounds.left;
        point.vx = -point.vx * linearDampingFactor;

        // Adjust vertical velocity based on tangential velocity
        point.vy += tangentialVelocity * friction;
    }
    if (point.x >= bounds.right) {
        point.x = bounds.right;
        point.vx = -point.vx * linearDampingFactor;

        // Adjust vertical velocity based on tangential velocity
        point.vy -= tangentialVelocity * friction;
    }
    if (point.y <= bounds.top) {
        point.y = bounds.top;
        point.vy = -point.vy * linearDampingFactor;

        // Adjust horizontal velocity based on tangential velocity
        point.vx += tangentialVelocity * friction;
    }
    if (point.y >= bounds.bottom) {
        point.y = bounds.bottom;
        point.vy = -point.vy * linearDampingFactor;

        // Adjust horizontal velocity based on tangential velocity
        point.vx -= tangentialVelocity * friction;
    }

    // Apply angular damping to reduce angular velocity over time
    point.omega *= angularDampingFactor;

    // Update rotation based on angular velocity
    point.rotation += point.omega;
}



const gravityVector = { x: 0, y: 0.00 }; // Gravity pointing downwards
const bounds = { left: 100, right: 800, top: 100, bottom: 600 }; // Define bounds of the canvas or space
// Illustrative material values, not SI-calibrated. Mass matters when balls collide;
// bounciness and friction control how each ball responds to the box.
const ballMaterials = {
    bowlingBall: { mass: 3, bounciness: 0.915, friction: 0.3 }
    , beachBall: { mass: 0.3, bounciness: 0.85, friction: 0.65 }
};


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                  ...ballMaterials.bowlingBall
                 , x: 250, y: 150
                 , radius: 10
                 , vx: 1, vy: 0
            })
            , new Point({
                  ...ballMaterials.bowlingBall
                 , x: 300, y: 320
                 , vx: 10
                 , vy: -8
                 , radius: 30
                , omega: 0
                , rotation: 30 // Current rotation angle
            })
            , new Point({
                  ...ballMaterials.beachBall
                 , x: 450, y: 520
                 , vx: .4, vy: -.1
                 , radius: 8
            })
        )
    }

    draw(ctx){
        this.clear(ctx)
        this.points.forEach(point => {
            applyGravityAndBoundsAngularWithRadius(point, gravityVector, bounds)
        })

        ctx.save()
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top)
        ctx.restore()
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
