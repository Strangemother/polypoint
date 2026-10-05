/*
title: Gravity Points 2.5 - SI Physics and Body Collisions
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
    mouse
    dragging
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

// Positions and radii stay in pixels; velocity, spin, gravity and time use SI units.
const physicsWorld = {
    pixelsPerMeter: 100
    , gravity: { x: 0, y: 0.081 }
    , airDensity: 1.225
    , fixedStepSeconds: 1 / 120
    , maxSubSteps: 12
};

const materials = {
    // Densities are approximate; collision coefficients are illustrative.
    aluminum: { density: 2700, bounciness: 0.45, friction: 0.4, dragCoefficient: 0.47 }
    , lead: { density: 11340, bounciness: 0.25, friction: 0.5, dragCoefficient: 0.47 }
    , beachBall: { density: 20, bounciness: 0.8, friction: 0.65, dragCoefficient: 0.47 }
};

const boxMaterial = { bounciness: 0.8, friction: 0.5 };
const box = { left: 100, right: 800, top: 100, bottom: 600 };

// Coordinates are in meters, velocity in meters per second, and mass in kilograms.
const createSphere = ({ x, y, vx=0, vy=0, mass, material, rotation=0 }) => {
    if (!Number.isFinite(mass) || mass <= 0 ||
            !Number.isFinite(material?.density) || material.density <= 0) {
        throw new RangeError('A sphere needs a positive mass and material density.');
    }

    const radiusMeters = Math.cbrt(3 * mass / (4 * Math.PI * material.density));
    const scale = physicsWorld.pixelsPerMeter;
    return new Point({
        ...material
        , x: x * scale
        , y: y * scale
        , vx
        , vy
        , mass
        , radiusMeters
        , radius: radiusMeters * scale
        , omega: 0
        , rotation
    });
};

const bodyMass = point => {
    if (!Number.isFinite(point.mass) || point.mass <= 0) {
        throw new RangeError('Colliding bodies need a positive mass in kilograms.');
    }
    return point.mass;
};

const bodyRadiusMeters = point => {
    const radius = Number.isFinite(point.radiusMeters)
        ? point.radiusMeters
        : point.radius / physicsWorld.pixelsPerMeter;
    if (!Number.isFinite(radius) || radius <= 0) {
        throw new RangeError('Colliding bodies need a positive radius.');
    }
    return radius;
};

const sphereInertia = point => {
    const inertia = Number.isFinite(point.inertia) && point.inertia > 0
        ? point.inertia
        : 0.4 * bodyMass(point) * bodyRadiusMeters(point) * bodyRadiusMeters(point);
    return inertia;
};

const coefficient = value => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
const frictionCoefficient = value => Number.isFinite(value) ? Math.max(0, value) : 0;

const applyGravityAndAirDrag = (point, dt) => {
    point.vx += physicsWorld.gravity.x * dt;
    point.vy += physicsWorld.gravity.y * dt;

    const speed = Math.hypot(point.vx, point.vy);
    const dragCoefficient = frictionCoefficient(point.dragCoefficient);
    if (speed > 0 && dragCoefficient > 0) {
        const area = Math.PI * point.radiusMeters * point.radiusMeters;
        const dragForce = 0.5 * physicsWorld.airDensity * dragCoefficient * area * speed * speed;
        const speedReduction = Math.min(speed, dragForce * dt / point.mass);
        point.vx -= point.vx / speed * speedReduction;
        point.vy -= point.vy / speed * speedReduction;
    }

    const scale = physicsWorld.pixelsPerMeter;
    point.x += point.vx * dt * scale;
    point.y += point.vy * dt * scale;
    point.omega = Number.isFinite(point.omega) ? point.omega : 0;
    point.rotation += radiansToDegrees(point.omega * dt);
};

const resolveSurfaceContact = (point, normalX, normalY, surface) => {
    const mass = bodyMass(point);
    const radius = bodyRadiusMeters(point);
    const inertia = sphereInertia(point);
    const normalSpeed = point.vx * normalX + point.vy * normalY;
    if (normalSpeed <= 0) return;

    const bounce = normalSpeed < 0.05
        ? 0
        : Math.sqrt(coefficient(point.bounciness) * coefficient(surface.bounciness));
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
    const maxFrictionImpulse =
        Math.sqrt(frictionCoefficient(point.friction) * frictionCoefficient(surface.friction)) *
        normalImpulse;
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

const resolveBoxCollision = point => {
    const radius = point.radius;
    if (point.x - radius < box.left) {
        point.x = box.left + radius;
        resolveSurfaceContact(point, -1, 0, boxMaterial);
    }
    if (point.x + radius > box.right) {
        point.x = box.right - radius;
        resolveSurfaceContact(point, 1, 0, boxMaterial);
    }
    if (point.y - radius < box.top) {
        point.y = box.top + radius;
        resolveSurfaceContact(point, 0, -1, boxMaterial);
    }
    if (point.y + radius > box.bottom) {
        point.y = box.bottom - radius;
        resolveSurfaceContact(point, 0, 1, boxMaterial);
    }
};

class BodyHitReactor {
    constructor(points, { beforeStep=undefined }={}) {
        if (!points || typeof points[Symbol.iterator] !== 'function') {
            throw new TypeError('BodyHitReactor requires an iterable collection of points.');
        }
        if (beforeStep !== undefined && typeof beforeStep !== 'function') {
            throw new TypeError('beforeStep must be a function when provided.');
        }
        this.points = points;
        this.beforeStep = beforeStep;
        this.accumulator = 0;
        this.timer = undefined;
        this.lastTime = undefined;
        this.positionCorrection = 0.8;
        this.penetrationSlopMeters = 0.001;
        this.positionIterations = 4;
    }

    step() {
        const points = Array.from(this.points);
        for (let iteration = 0; iteration < this.positionIterations; iteration++) {
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    this.resolvePair(points[i], points[j]);
                }
            }
        }
        return this;
    }

    resolvePair(a, b) {
        const scale = physicsWorld.pixelsPerMeter;
        const radiusA = bodyRadiusMeters(a);
        const radiusB = bodyRadiusMeters(b);
        const dx = (b.x - a.x) / scale;
        const dy = (b.y - a.y) / scale;
        const distance = Math.hypot(dx, dy);
        const combinedRadius = radiusA + radiusB;
        if (distance >= combinedRadius) return false;

        const normalX = distance > 0 ? dx / distance : 1;
        const normalY = distance > 0 ? dy / distance : 0;
        const massA = bodyMass(a);
        const massB = bodyMass(b);
        const inverseMassA = 1 / massA;
        const inverseMassB = 1 / massB;
        const inverseMassSum = inverseMassA + inverseMassB;
        const inertiaA = sphereInertia(a);
        const inertiaB = sphereInertia(b);
        const radiusAContactX = normalX * radiusA;
        const radiusAContactY = normalY * radiusA;
        const radiusBContactX = -normalX * radiusB;
        const radiusBContactY = -normalY * radiusB;
        const penetration = combinedRadius - distance;
        const correction = Math.max(penetration - this.penetrationSlopMeters, 0) *
            this.positionCorrection / inverseMassSum;

        a.x -= normalX * correction * inverseMassA * scale;
        a.y -= normalY * correction * inverseMassA * scale;
        b.x += normalX * correction * inverseMassB * scale;
        b.y += normalY * correction * inverseMassB * scale;
        a.omega = Number.isFinite(a.omega) ? a.omega : 0;
        b.omega = Number.isFinite(b.omega) ? b.omega : 0;

        const velocityAtContact = (point, rx, ry) => ({
            x: point.vx - point.omega * ry,
            y: point.vy + point.omega * rx
        });
        const contactA = velocityAtContact(a, radiusAContactX, radiusAContactY);
        const contactB = velocityAtContact(b, radiusBContactX, radiusBContactY);
        let relativeX = contactB.x - contactA.x;
        let relativeY = contactB.y - contactA.y;
        const normalSpeed = relativeX * normalX + relativeY * normalY;

        if (normalSpeed < 0) {
            const bounce = Math.abs(normalSpeed) < 0.05
                ? 0
                : Math.sqrt(coefficient(a.bounciness) * coefficient(b.bounciness));
            const normalImpulse = -(1 + bounce) * normalSpeed / inverseMassSum;
            const normalImpulseX = normalX * normalImpulse;
            const normalImpulseY = normalY * normalImpulse;
            a.vx -= normalImpulseX * inverseMassA;
            a.vy -= normalImpulseY * inverseMassA;
            b.vx += normalImpulseX * inverseMassB;
            b.vy += normalImpulseY * inverseMassB;

            relativeX = b.vx - a.vx;
            relativeY = b.vy - a.vy;
            const tangentX = -normalY;
            const tangentY = normalX;
            const tangentSpeed = relativeX * tangentX + relativeY * tangentY +
                b.omega * (radiusBContactX * tangentY - radiusBContactY * tangentX) -
                a.omega * (radiusAContactX * tangentY - radiusAContactY * tangentX);
            const inverseTangentMass = inverseMassSum +
                radiusA * radiusA / inertiaA + radiusB * radiusB / inertiaB;
            const friction = Math.sqrt(
                frictionCoefficient(a.friction) * frictionCoefficient(b.friction)
            );
            const tangentImpulse = Math.max(
                -friction * normalImpulse,
                Math.min(friction * normalImpulse, -tangentSpeed / inverseTangentMass)
            );
            const impulseX = tangentX * tangentImpulse;
            const impulseY = tangentY * tangentImpulse;
            a.vx -= impulseX * inverseMassA;
            a.vy -= impulseY * inverseMassA;
            b.vx += impulseX * inverseMassB;
            b.vy += impulseY * inverseMassB;
            a.omega += (-radiusAContactY * -impulseX + radiusAContactX * -impulseY) / inertiaA;
            b.omega += (-radiusBContactY * impulseX + radiusBContactX * impulseY) / inertiaB;
        }
        return true;
    }

    advance(elapsedSeconds) {
        if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
            throw new RangeError('Elapsed time must be a finite, non-negative number of seconds.');
        }
        const fixedStep = physicsWorld.fixedStepSeconds;
        const maxElapsed = fixedStep * physicsWorld.maxSubSteps;
        this.accumulator += Math.min(elapsedSeconds, maxElapsed);

        let steps = 0;
        while (this.accumulator + fixedStep * 1e-9 >= fixedStep &&
                steps < physicsWorld.maxSubSteps) {
            this.beforeStep?.(fixedStep);
            this.step();
            this.accumulator = Math.max(0, this.accumulator - fixedStep);
            steps++;
        }
        return steps;
    }

    startTicker(intervalMs=10) {
        if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
            throw new RangeError('Ticker interval must be a positive number of milliseconds.');
        }
        this.stopTicker();
        this.accumulator = 0;
        this.lastTime = performance.now();
        this.timer = setInterval(() => {
            const now = performance.now();
            const elapsed = Math.max(0, (now - this.lastTime) / 1000);
            this.lastTime = now;
            this.advance(elapsed);
        }, intervalMs);
        return this;
    }

    stopTicker() {
        if (this.timer !== undefined) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.lastTime = undefined;
        return this;
    }
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



class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            createSphere({
                x: 2.2, y: 1.5, vx: 2, vy: -1.5, mass: 10, material: materials.aluminum
            })
            , createSphere({
                x: 3.7, y: 2.5, vx: -1, vy: 0, mass: 10, material: materials.lead, rotation: 30
            })
            , createSphere({
                x: 5.8, y: 4.5, vx: -1.8, vy: -0.5, mass: 0.3, material: materials.beachBall
            })
        )
        this.dragging.add(...this.points)
        this.bouncy = new BodyHitReactor(this.points, {
            beforeStep: dt => {
                this.points.forEach(point => {
                    applyGravityAndAirDrag(point, dt);
                    resolveBoxCollision(point);
                });
            }
        });
        this.bouncy.startTicker(10);
    }

    stopPhysics() {
        this.bouncy?.stopTicker();
    }

    draw(ctx){
        this.clear(ctx)

        ctx.save()
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1
        ctx.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top)
        ctx.restore()
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
