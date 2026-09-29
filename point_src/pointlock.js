
class PointLock {
    /* Linear lock.

    A linear locked point can move _only_ along the given axis - the direction.

    For dragging and interaction, the point is locked by the linear direction relative to _other_.

        point.lock.linear(other)

    The point may only move towards, or away from the other, disregarding the `point` direction. When `other` position changes, the linear lock will reflect this.

    ---

    The point may only move in the direction of itself (forward or reverse)

        point.lock.linear()

    When rotating the point, the linear lock will reflect this.

    ---

    Lock between two. Essentially the same as `other` (only `a`), but with a _max limit_.

        point.lock.linear(a, b)

    */

    constructor(point) {
        this.point = point
    }

    linear(a, b) {
        if (b !== undefined) {
            // perform a to b
            return this.between(a,b)
        }

        if (a !== undefined) {
            /* A point may only exist on the line extending from the center
           of the given point (to inifinity) */
            return this.radial(a)
        }

        /* Locked to the pointing direction of self. Only moving _forward_ or _backward_ */
        return this.facing()
    }

    facing() {
        /* Locked to the pointing direction of self, assuming a _ray_ case from the center through
        the tip of this (self) point. Only moving _forward_ or _backward_ but not sliding.

        The point may rotate freely, but will be constrained when `x` or `y` is altered.
        */

        // lock X/Y through the direcitonal ray
        return this.radial(this.point)
    }

    between(a, b) {
        /* self point may only exist between the two given points. */

        // lock x/y between the invisible line of points `a` and `b`.
    }

    radial(origin) {
        /* cast from the origin, no sliding.

        Note, this is already set from the existing origin. such that from the first call the sight-line
        is assumed. When moving the point, the _origin_ can move freely, where _this_ self point
        may only move along the cast ray from the origin.

        luckily moving the origin doesn't affect the target (self) point.
        */

        // lock x/y along the directional ray of the origin.
    }
}


Polypoint.head.install(PointLock)
Polypoint.head.lazierProp('Point', function () {
    return new PointLock(this)
}, 'lock')
