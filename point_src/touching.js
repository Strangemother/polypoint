/* Some simple functions for a range of _points touching_
For more interactive components, consider the
collision or intersection components.
*/

const pointToPointContact = function(a, b) {
    let d = a.distanceTo(b)
    if(d - b.radius > a.radius) { return false };
    return true;
}


const pointToPointContactEdge = function(a, b, edgeLimit=undefined) {
    let d = a.distanceTo(b)
    let el = edgeLimit == undefined? 0: edgeLimit
    if(d - b.radius > a.radius + el) { return false };
    if(edgeLimit == undefined) {
        return true;
    }
    // distance test for edges.
    // ensure the x/y+radius  + x/y+radius is edge tested.
    let rp = a.radius + b.radius
    let overlap = rp - d
    return overlap < edgeLimit
}


/*
Given a point, and another list of points,
return any points _touching_ the target point.
*/
const pointToManyContact = function(a, many, excludeTarget=true, edgeLimit=undefined) {
    return many.filter((p)=> {
        if(excludeTarget && a == p) { return }
        return pointToPointContactEdge(a,p, edgeLimit)
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