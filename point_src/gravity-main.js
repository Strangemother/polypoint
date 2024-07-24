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

const applyGravityAndBoundsAngular1 = function(point, gravityVector, bounds, dampingFactor, friction) {
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

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vy / point.radius) * friction;

    }
    if (point.x >= bounds.right) {
        point.x = bounds.right;
        point.vx = -point.vx * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega -= (point.vy / point.radius) * friction;

    }
    if (point.y <= bounds.top) {
        point.y = bounds.top;
        point.vy = -point.vy * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vx / point.radius) * friction;

    }
    if (point.y >= bounds.bottom) {
        point.y = bounds.bottom;
        point.vy = -point.vy * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vx / point.radius) * friction;

    }

    // Apply damping to reduce angular velocity over time
    point.omega *= dampingFactor;

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



const gravityVector = { x: 0, y: 0.1 }; // Gravity pointing downwards
const bounds = { left: 0, right: 800, top: 0, bottom: 600 }; // Define bounds of the canvas or space
const linearDampingFactor = 0.95; // Adjust this value to control the bouncing effect
const angularDampingFactor = 0.998; // Adjust this value to control the rotation speed reduction
const friction = .9; // Adjust this value to simulate friction at the point of contact


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 250, y: 150
                , radius: 10
                , vx: 1, vy: 0
                , mass: 2
            })
            , new Point({
                 x: 300, y: 320
                , vx: 2
                , vy: -2
                , radius: 10
                , mass: 10
                , omega: -.30 // Angular velocity
                , rotation: 30 // Current rotation angle
                , radius: 30 // Assuming a circular point for moment of inertia
                , I: 0.5 * 0.1 * 50 * 50 // Moment of inertia for a solid disk (0.5 * mass * radius^2)

            })
            , new Point({
                 x: 450, y: 520
                , vx: .4, vy: -.1
                , radius: 8
                , mass: 8
            })
        )
    }

    draw(ctx){
        this.clear(ctx)
        applyGravityAndBounds(this.points[0], gravityVector, bounds, linearDampingFactor)
        applyGravityAndBoundsAngular1(this.points[1], gravityVector, bounds, linearDampingFactor, angularDampingFactor, friction);

        // this.points.last().rotation += 2
        this.points.pen.indicators(ctx)

    }
}

stage = MainStage.go(/*{ loop: true }*/)
