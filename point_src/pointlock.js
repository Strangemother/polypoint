
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
        this._facingOrigin = {x: point.x, y: point.y}
    }

    linear(a, b) {
        if (b !== undefined) {
            // perform a to b
            return this.between(a, b)
        }

        if (a !== undefined) {
            /* A point may only exist on the line extending from the center
           of the given point (to infinity) */
            return this.radial(a)
        }

        /* Locked to the pointing direction of self. Only moving _forward_ or _backward_ */
        return this.facing()
    }

    facing() {
        /* Locked to the pointing direction of self, assuming a _ray_ case from the center through
        the tip of this (self) point. Only moving _forward_ or _backward_ but not sliding.

        The constraint is applied only when this method is called.
        */

        this._facingOrigin.radians = this.point.radians
        const constrainedPoint = this.radial(this._facingOrigin)
        // Must update after, else the rotation of the origin
        // will be incorrect.
        this._facingOrigin.x = constrainedPoint.x
        this._facingOrigin.y = constrainedPoint.y
        return constrainedPoint
    }

    between(a, b) {
        /* self point may only exist between the two given points. */

        const point = this.point
            , originX = a.x
            , originY = a.y
            , dx = b.x - originX
            , dy = b.y - originY
            , lengthSquared = dx * dx + dy * dy
            , f = ()=> { 
                let lr = (
                        (point.x - originX) * dx 
                      + (point.y - originY) * dy
                    ) / lengthSquared
                let _min = Math.min(1, lr)
                return Math.max(0, _min)
            }
        const amount = lengthSquared === 0 ? 0 : f()
        point.x = originX + amount * dx
        point.y = originY + amount * dy
        return point
    }

    radial(origin) {
        /* cast from the origin, no sliding.

        Note, this is already set from the existing origin. such that from the first call the sight-line
        is assumed. When moving the point, the _origin_ can move freely, where _this_ self point
        may only move along the cast ray from the origin.

        luckily moving the origin doesn't affect the target (self) point.
        */

        const point = this.point
        const originX = origin.x
        const originY = origin.y
        const radians = origin.radians
        const dx = Math.cos(radians)
        const dy = Math.sin(radians)
        const amount = (point.x - originX) * dx + (point.y - originY) * dy
        point.x = originX + amount * dx
        point.y = originY + amount * dy
        return point
    }

    ray(origin, min=0, max=Infinity) {
        /* cast from the origin, allowing sliding along the ray within the min and max bounds.

        Bounds are signed multiples of origin.radius; negative values extend behind the origin.
        
        1. (default 0) min is the minimum multiple.
        2. (default Infinity) max is the maximum multiple.

        Examples: 

            // lock to the outside of a point.
            point.lock.ray(other, 1) 

            // lock one half inside.
            point.lock.ray(other, .5, 1) 

            // axis lock
            point.lock.ray(other, -1, 1) 

            // lock between 1/3 of the radius, to a max of 3X the radius.
            point.lock.ray(other,  .3,  3) 
        */

        const point = this.point
        const originX = origin.x
        const originY = origin.y
        const radians = origin.radians
        const radius = origin.radius
        const dx = Math.cos(radians)
        const dy = Math.sin(radians)
        const projected = (point.x - originX) * dx + (point.y - originY) * dy
        const minDistance = min * radius
        const maxDistance = max === Infinity ? Infinity : max * radius
        const amount = Math.max(minDistance, Math.min(maxDistance, projected))
        point.x = originX + amount * dx
        point.y = originY + amount * dy
        return point
    }
}


Polypoint.head.install(PointLock)
Polypoint.head.lazierProp('Point', function () {
    return new PointLock(this)
}, 'lock')
