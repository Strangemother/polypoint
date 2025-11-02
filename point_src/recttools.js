const twoPointBox = function(a, b, func) {
    /* Given two points, return 4 lines

        let lines = twoPointBox(this.squishA, this.squishB)
        lines.forEach(l=>l.render(ctx))
    */
    let asLine = func || function(c, d) {
        let l = new Line(c, d)
        l.doTips = false
        return l;
    }

    return [
          // x top
          asLine([a.x, a.y], [b.x, a.y])
          // y left
        , asLine([a.x, a.y], [a.x, b.y])
        // x bottom
        , asLine([a.x, b.y], [b.x, b.y])
        // y right
        , asLine([b.x, a.y], [b.x, b.y])
    ]
}


const disorderdTwoPointsAsRect = function(a, b) {

    return [
          // x top
          {x: a.x, y: a.y}, {x: b.x, y: a.y}
          // y left
        , {x: a.x, y: a.y}, {x: a.x, y: b.y}
        // x bottom
        , {x: a.x, y: b.y}, {x: b.x, y: b.y}
        // y right
        , {x: b.x, y: a.y}, {x: b.x, y: b.y}
    ]
}


const twoPointsAsRectOrdered = function(a, b) {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    return [
        { x: minX, y: minY }, // Bottom-left corner
        { x: maxX, y: minY }, // Bottom-right corner
        { x: maxX, y: maxY }, // Top-right corner
        { x: minX, y: maxY }  // Top-left corner
    ];
}




// const asDimensions = function() {

//     return {
//         "x": 0,
//         "y": 0,
//         "width": 1394.09375,
//         "height": 698.046875,
//         "top": 0,
//         "right": 1394.09375,
//         "bottom": 698.046875,
//         "left": 0
//     }

// }

// bottom: 709.390625
// height: 709.390625
// left: 0
// right: 477.1875
// top: 0
// width: 477.1875
// x: 0
// y: 0
class RectTools extends DOMRect {
    /*A Shape to assist with within/outside*/
    has() {
        for(let p of Array.from(arguments)) {
            if(!this.hasPoint(p)) {
                return false
            }
        }
        return true
    }

    contains() {
        for(let p of Array.from(arguments)) {
            if(!this.containsPoint(p)) {
                return false
            }
        }
        return true
    }

    hasPoint(p, testRadius=false) {
        return this.containsPoint(p, testRadius)
    }

    containsPoint(p, testRadius=true) {
        const r = testRadius? p.radius: 0
        // debugger;
        const _tests = [
              () => p.x < this.x + r
            , () => p.y < this.y + r
            , () => p.x > this.width - r
            , () => p.y > this.height - r
        ]

        // break early tests
        for(let f of _tests) {
            if( f() ) {
                // console.log(`not pass ${f}`)
                return false
            };
        }

        return true
    }

    touchingPoint(p, r=p.radius) {
        // const r = p.radius
        // debugger;
        const _tests = [
              () => p.x < this.x - r
            , () => p.y < this.y - r
            , () => p.x > this.width + r
            , () => p.y > this.height + r
        ]

        // break early tests
        for(let f of _tests) {
            if( f() ) {
                // console.log(`not pass ${f}`)
                return false
            };
        }

        // return intersects(p, this)
        // return hasIntersection(p, this)
        return true
        // let cornerDistance_sq = (p.x - (this.x - this.width/2)) ^2
        //                       + (p.y - (this.y - this.height/2)) ^2
        //                         ;

        // return (cornerDistance_sq <= (p.radius^2));
    }
}



const hasIntersection = ({ x: cx, y: cy, radius: cr}, {x, y, width, height}) => {
    const distX = Math.abs(cx - width / 2);
    const distY = Math.abs(cy - height / 2);
    // bodmas
    // brackets
    //  divide
    //  mult
    //  add
    //  sub
    if (distX > (width / 2 + cr)) {
        // console.log('Break at 1')
        return false;
    }

    if (distY > (height / 2 + cr)) {
        // console.log('Break at 2')
        return false;
    }

    let halfWidth = width / 2
    if (distX <= halfWidth) {
        // console.log('3', distX, halfWidth)
        return true;
    }
    if (distY <= (height / 2)) {
        // console.log('Break at 4')
        return true;
    }

    const deltaX = distX - width / 2;
    const deltaY = distY - height / 2;
    // console.log(deltaY, deltaX)
    return deltaX * deltaX + deltaY * deltaY <= cr * cr;
};



const intersect = function(c, r){
    let halfWidth = r.width / 2
    let halfHeight = r.height / 2
    let cx = Math.abs(c.x - r.x - halfWidth);
    let xDist = halfWidth + c.radius;
    if (cx > xDist) return false;

    let cy = Math.abs(c.y - r.y - halfHeight);
    let yDist = halfHeight + c.radius;

    if (cy > yDist)  return false;
    if (cx <= halfWidth || cy <= halfHeight) return true;

    let xCornerDist = cx - halfWidth;
    let yCornerDist = cy - halfHeight;
    let xCornerDistSq = xCornerDist * xCornerDist;
    let yCornerDistSq = yCornerDist * yCornerDist;
    let maxCornerDistSq = c.radius * c.radius;
    return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;
}


const intersects = function(circle, rect) {

    const circleDistance = {}

    // circleDistance.x = Math.abs(circle.x - rect.x);
    // circleDistance.y = Math.abs(circle.y - rect.y);
    circleDistance.x = Math.abs(circle.x - (rect.x+rect.width/2));
    circleDistance.y = Math.abs(circle.y - (rect.y+rect.height/2));
    let cr = circle.radius

    if (circleDistance.x > (rect.width/2 + cr)) { return false; }
    if (circleDistance.y > (rect.height/2 + cr)) { return false; }

    if (circleDistance.x <= (rect.width/2)) { return true; }
    if (circleDistance.y <= (rect.height/2)) { return true; }

    let cornerDistance_sq = (circleDistance.x - rect.width/2)^2 +
                         (circleDistance.y - rect.height/2)^2;

    return (cornerDistance_sq <= (cr^2));
}



const testRect = function() {

    const r = new RectTools(10, 20, 200, 300)
    // r.containsPoint(new Point(20, 30)) == true
    const tests = [
        // point conf, expected
          [ [20, 30]   , true]
        , [ [10, 20, 0]   , true]
        , [ [10, 20, 1]   , false]
        , [ [1, 2]     , false]
        , [ [120, 100] , true]
        , [ [300, 400] , false]
    ];

    console.log("within (10, 20, 200, 300)")
    tests.forEach((v, i, a)=>{
        [props, expected] = v
        const str = `new Point(${props}) == ${expected}`
        let point = new Point(props)
        let res = r.containsPoint(point) == expected
        console.log(res, str)
    })

    const rt = new RectTools(20, 20, 200, 200)
    rt.containsPoint(new Point(29,20,20)) == false
    rt.containsPoint(new Point(30,20,20)) == true
}