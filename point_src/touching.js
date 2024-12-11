/* Some simple functions for a range of _points touching_
For more interactive components, consider the
collision or intersection components.
*/

const pointToPointContact = function(a, b) {
    if(a.distanceTo(b) - b.radius > a.radius) { return false };
    return true
}


/*
Given a point, and another list of points,
return any points _touching_ the target point.
*/
const pointToManyContact = function(a, many, excludeTarget=true) {
    return many.filter((p)=> {
        if(excludeTarget && a == p) { return }
        return pointToPointContact(a,p)
    })
}

Polypoint.head.installFunctions('Point', {
    isTouching(other) {
        return pointToPointContact(this, other)
    }
})

Polypoint.head.installFunctions('PointList', {
    getTouching(point) {
        return pointToManyContact(point, this)
    }
})