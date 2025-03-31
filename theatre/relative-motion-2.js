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
    ../point_src/keyboard.js

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


const cosSin = function(value=1) {
    /* The cosSin object is a simple helper for cos/sin of a value.

        cs = cosSin(100)
        cs.cos()
        cs.sin()

    Provide a multiplier - useful when rotating around a _point_ (such as a normalised value)

        cs.sin(.4)
     */
    return {
        cos:(multiplier=1) => Math.cos(value) * multiplier
        , sin:(multiplier=1) => Math.sin(value) * multiplier
        , spin(item) {
            /* Spin through a normalised direction,

                const cs = cosSin(p.radians)
                // Apply the direction based on the point's rotation
                // Transform the direction vector to account for the point's rotation
                let spun = cs.spin(normalizedDir)

                const rotatedDir = {
                    x: spun.x.cos - spun.y.sin,
                    y: spun.x.sin + spun.y.cos
                };

            Synonymous to:
                let spunX = cs.spin(normalizedDir.x)
                let spunY = cs.spin(normalizedDir.y)

                const rotatedDir = {
                    x: spunX.cos - spunY.sin,
                    y: spunX.sin + spunY.cos
                };
             */
            if(item.x !== undefined) {
                return {
                    x:this.spinOne(item.x)
                    , y:this.spinOne(item.y)
                }
            }
            return this.spinOne(item)
        }
        , spinOne(multiplier) {
            let c = this.cos(multiplier)
            let s = this.sin(multiplier)
            return {
                    cos:c, x:c,
                    sin:s, y:s,
                }
        }
    }
}


class Addon {
    /* An Addon applies some core functionality on the polypoint mixin
    such as a constructor, and destroy methods.
     */
    constructor(parent) {
        this.parent = parent;
    }
}

class RelativeMotion extends Addon {

    _relativeMove(direction, speed=undefined, minSpeed=0, maxSpeed=1) {
        let p = this.parent
        // Normalize the direction vector
        const magnitude = direction.magnitude()

        // Avoid division by zero if direction vector is zero
        if (magnitude === 0) return;
        const normalizedDir = direction.normalized()

        // Clamp speed to be within the allowed range
        // const clampedSpeed = clamp(speed, minSpeed, maxSpeed);

        // Get the current rotation of the point `p` in radians
        const cs = cosSin(p.radians)

        // Apply the direction based on the point's rotation
        // Transform the direction vector to account for the point's rotation
        let spun = cs.spin(normalizedDir)
        const rotatedDir = {
            x: spun.x.cos - spun.y.sin,
            y: spun.x.sin + spun.y.cos
        };

        if(speed == undefined) { speed = 1 }
        // Update position `p` based on the rotated direction and clamped speed
        p.x += rotatedDir.x * clamp(speed, minSpeed, maxSpeed);
        p.y += rotatedDir.y * clamp(speed, minSpeed, maxSpeed);
    }

    move(direction, speed, minSpeed, maxSpeed) {
        return this._relativeMove(direction, undefined, minSpeed, maxSpeed)
    }

    towards(other, turnSpeed=.1, speed, minSpeed, maxSpeed) {
        this.parent.turnTo(other, turnSpeed)
        return this.move(new Point({x:1, y:0}), speed, minSpeed, maxSpeed)
    }
}


Polypoint.head.lazierProp('Point',
    function relative() {
        return new RelativeMotion(this)
    }
);




class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0
        this.a = new Point({ x: 200, y: 200, vx: 0, vy: 0})
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

        // this.a.relative.move({x: 1, y: 0}, 0, 4)
        this.a.relative.towards(this.clickPoint)
        this.a.pen.indicator(ctx)
        this.clickPoint.pen.indicator(ctx)
    }
}

const stage = MainStage.go()
