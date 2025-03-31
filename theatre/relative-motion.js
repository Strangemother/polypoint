/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js


*/
const forward = function(p, turnSpeed=1, minSpeed=0, maxSpeed=1) {
    /* walk in the direction of the rotation*/

    let target = p.target
    if(target == undefined) {
        // target = p.project()
        target = Point.mouse.position
    }

    const mp = target //Point.mouse.position // target;
    p.turnTo(mp, turnSpeed);
    const r = p.radians
    const distance = p.distanceTo(mp)
    const radius = p.radius

    let stepAmount = (distance / radius ) * .3

    if(distance *.5 < radius) {
        p.target = undefined
    }

    stepAmount = clamp(stepAmount, minSpeed, maxSpeed)
     p.x += stepAmount * Math.cos(r);
     p.y += stepAmount * Math.sin(r);
}

// Helper function to clamp a value within a range
// const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const relMoveNoRotation = function(p, direction, speed = 1, minSpeed = 0, maxSpeed = 1) {
    // Normalize the direction vector to ensure it's unit length
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    // Avoid division by zero if direction vector is zero
    if (magnitude === 0) return;

    const normalizedDir = {
        x: direction.x / magnitude,
        y: direction.y / magnitude
    };

    // Clamp speed to be within the allowed range
    const clampedSpeed = clamp(speed, minSpeed, maxSpeed);

    // Update position `p` based on the normalized direction and speed
    p.x += normalizedDir.x * clampedSpeed;
    p.y += normalizedDir.y * clampedSpeed;
};


const relMove = function(p, direction, speed = 1, minSpeed = 0, maxSpeed = 1) {
    // Normalize the direction vector
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    // Avoid division by zero if direction vector is zero
    if (magnitude === 0) return;

    const normalizedDir = {
        x: direction.x / magnitude,
        y: direction.y / magnitude
    };

    // Clamp speed to be within the allowed range
    const clampedSpeed = clamp(speed, minSpeed, maxSpeed);

    // Get the current rotation of the point `p` in radians
    const r = p.radians;

    // Apply the direction based on the point's rotation
    // Transform the direction vector to account for the point's rotation
    const rotatedDir = {
        x: normalizedDir.x * Math.cos(r) - normalizedDir.y * Math.sin(r),
        y: normalizedDir.x * Math.sin(r) + normalizedDir.y * Math.cos(r)
    };

    // Update position `p` based on the rotated direction and clamped speed
    p.x += rotatedDir.x * clampedSpeed;
    p.y += rotatedDir.y * clampedSpeed;
};


const relMoveD = function(p, direction, speed = 1, minSpeed = 0, maxSpeed = 1) {
    // Normalize the direction vector
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    // Avoid division by zero if direction vector is zero
    if (magnitude === 0) return;

    const normalizedDir = {
        x: direction.x / magnitude,
        y: direction.y / magnitude
    };

    // Clamp speed to be within the allowed range
    // const clampedSpeed = clamp(speed, minSpeed, maxSpeed);

    // Get the current rotation of the point `p` in radians
    const r = p.radians;

    // Apply the direction based on the point's rotation
    // Transform the direction vector to account for the point's rotation
    const rotatedDir = {
        x: normalizedDir.x * Math.cos(r) - normalizedDir.y * Math.sin(r),
        y: normalizedDir.x * Math.sin(r) + normalizedDir.y * Math.cos(r)
    };

    // Update position `p` based on the rotated direction and clamped speed
    p.x += rotatedDir.x * clamp(direction.x, minSpeed, maxSpeed);
    p.y += rotatedDir.y * clamp(direction.y, minSpeed, maxSpeed);
};

const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

const lerp = (x, y, a) => x * (1 - a) + y * a;


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 100, y: 700, vx: 0, vy: 0})
        this.events.click(this.mouseClick.bind(this))
        this.clickPoint = new Point(0,0)

    }

    mouseClick(ev) {
        console.log('mouseClick', ev)
        this.clickPoint = new Point(ev.x, ev.y)
        this.a.target = this.clickPoint
    }

    draw(ctx) {
        this.clear(ctx)

        // forward(this.a, .1, 0, 4)
        // relMove(this.a, {x: 1, y: 1}, .2, 0, 4)
        relMoveD(this.a, {x: .2, y: .2}, .2, 0, 4)

        this.a.pen.indicator(ctx)
        this.clickPoint.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
