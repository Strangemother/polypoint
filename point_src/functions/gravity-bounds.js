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

const applyGravityAndBoundsAngularWithRadius = function(point, gravityVector, bounds, dampingFactor, friction) {
    // Apply gravity
    point.vx += gravityVector.x;
    point.vy += gravityVector.y;

    // Update position based on velocity
    point.x += point.vx;
    point.y += point.vy;

    // Check for collision with bounds and bounce
    if (point.x - point.radius <= bounds.left) {
        point.x = bounds.left + point.radius;
        point.vx = -point.vx * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vy / point.radius) * friction;
    }
    if (point.x + point.radius >= bounds.right) {
        point.x = bounds.right - point.radius;
        point.vx = -point.vx * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega -= (point.vy / point.radius) * friction;
    }
    if (point.y - point.radius <= bounds.top) {
        point.y = bounds.top + point.radius;
        point.vy = -point.vy * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vx / point.radius) * friction;
    }
    if (point.y + point.radius >= bounds.bottom) {
        point.y = bounds.bottom - point.radius;
        point.vy = -point.vy * dampingFactor;

        // Apply tangential velocity and adjust angular velocity
        point.omega += (point.vx / point.radius) * friction;
    }

    // Apply damping to reduce angular velocity over time
    point.omega *= dampingFactor;

    // Update rotation based on angular velocity
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

