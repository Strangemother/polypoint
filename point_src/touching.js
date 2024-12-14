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


const pointToPointContactEdgeIncludeInterals = function(a, b, edgeLimit=undefined) {
    let d = a.distanceTo(b)
    let el = edgeLimit == undefined? 0: edgeLimit

    if(a.internal == true || b.internal == true) {
        let r = b.radius - (a.radius + d)
        if(d < b.radius && r < el && r > 0) {
            return true
        } else {
            if(a.internal == true) {
                let v =  ( a.radius - (b.radius + d ) )
                return v>0 && v < el
            }
            return false
        }
    }

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
        return pointToPointContactEdgeIncludeInterals(a,p, edgeLimit)
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