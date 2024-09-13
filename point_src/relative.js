
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
        const v = clamp(speed, minSpeed, maxSpeed)
        p.x += rotatedDir.x * v;
        p.y += rotatedDir.y * v;
    }

    move(direction, speed, minSpeed, maxSpeed) {
        return this._relativeMove(direction, speed, minSpeed, maxSpeed)
    }

    left(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:0, y:-1}), speed, Math.min(speed, minSpeed), maxSpeed)
    }

    right(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:0, y:1}), speed, Math.min(speed, minSpeed), maxSpeed)
    }

    forward(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:1, y:0}), speed, Math.min(speed, minSpeed), maxSpeed)
    }

    backward(speed, minSpeed, maxSpeed) {
        if(maxSpeed==undefined) {
            maxSpeed = speed+1
        }
        return this.move(new Point({x:-1, y:0}), speed, minSpeed, maxSpeed)
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

