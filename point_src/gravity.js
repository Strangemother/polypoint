/*

The _gravity_ reactor provides 2d motion in a direction

*/

class GravityReactor {
    /* The reactor updates a point list, pulling all items in a direction
    provide a point as the directions for gravity. 0,0 for no gravity.*/
    constructor(gravityPoint, points, lockedPoints=[]) {
        this.gravity = gravityPoint
        this.points = points
        this.lockedPoints = new Set(lockedPoints)
    }

    step(delta=1, lockedPoints=this.lockedPoints) {
        // Apply gravity
        const gravity = this.gravity
        const lp = lockedPoints
        this.points.forEach(p=>{
            if(lp.has(p)) { return }
            p.x += (gravity.x * delta);
            p.y += (gravity.y * delta);
        })
    }
}