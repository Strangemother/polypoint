/*
Track the distances between given points.

    const d = new Distances;
    d.addPoints(...points);

    const near = d.closest(Point.mouse.position)

---

{% load content %}
<pre>{% code_content "events/mypoint-stage.js" %}</pre>

*/
class Distances {

    constructor(){
        this.points = new Map
    }

    addPoints() {
        for(let p of Array.from(arguments)){
            this.points.set(p.uuid, p)
        }
    }

    removePoints() {
        let r = []
        for(let p of Array.from(arguments)){
            let u = p.uuid
            r.push(this.points.delete(u?u:p))
        }
        return r
    }

    setPoints() {
        this.points.clear()
        this.addPoints.apply(this, arguments)
    }

    closest(point, maxDistance){
        /* Return the closest point to the given point, for example the nearest
        point to the mouse.

        Return the most near point at any distance:

            > distances.closest(mouse.position)
            point

        Return the most near point, also within 100px radius distance:

            > distances.closest(mouse.position, 100)

        Of which is the same as:

            // within 100px of the mouse position
            > distances.within(100, mouse.position)

        */
        var p;
        var low = undefined;
        /* Each distance is tested against the curent _low_.
        If the distance `v` is less than `low`, store `p`.

        In the first iteration, `setterFunc`, does not do a test, and replaces
        _itself_, with a testing function.

        This ensures we don't need to check for the first `undefined` .
        */
        if(maxDistance != undefined) {
            return this.within(maxDistance, point)
        }

        var setterFunc = (v, e) => {
            low = v
            p = e
            setterFunc = (v, e) => {
                if(v < low) {
                    low = v;
                    p = e
                }
            }
        }
        this.each(function(e,i,a){
            let t = point.distanceTo(e)
            setterFunc(t, e)
        })
        return p
    }

    /*
        Check if a point _intersects_ another point, returning the interecting
        top point.

            > intersect(mouse)
            point  // a point under the mouse.

        To _pad_ the overlap distance, provide an addition padding value:

            > intersect(mouse, 10) // add 10px around the perimeter
            point

        Useful if the intersection point has a radius:

            > intersect(mouse, mouse.radius) // add 10px around the perimeter

        This is the same as calling `closest()`, with the second arg as a function
        for radius testing.
     */
    intersect(point, padding) {
        return this.closest(point, (v,p)=> v<=padding+p.radius)
    }

    /* Return a point within the max distance set

        // return the closest point within 100px (radius) from the mouse position
        > distances.within(100, this.mouse.position)
        point

    For a _list_ of points, use `near`.

        near(point, distance=point.radius)
        [point, ...]

    */
    within(maxDistance, point){

        if(isPoint(maxDistance)) {
            maxDistance = maxDistance.radius
        }

        var p;
        var low = undefined;
        /* Each distance is tested against the curent _low_.
        If the distance `v` is less than `low`, store `p`.

        In the first iteration, `setterFunc`, does not do a test, and replaces
        _itself_, with a testing function.

        This ensures we don't need to check for the first `undefined` .
        */

        let test = (v) => v < maxDistance
        if(isFunction(maxDistance)) {
            test = maxDistance
        }
        var setterFunc = (v, e) => {
            if(test(v, e)) {
                if(low == undefined || (v <= low)){
                    low = v
                    p = e
                }
            }
        }

        this.each(function(e,i,a){
            let t = point.distanceTo(e)
            setterFunc(t, e)
        })
        return p
    }

    /* Return a list of points near the the given point at a given distance.*/
    near(point, distance=point.radius){
        const ps = new Set()
        // if(distance == undefined) {
        //     distance = point.radius
        // }
        const setterFunc = (v, e) => {
            /* Add to the store, if the value is within the distance.*/
            if(v > distance) { return }
            ps.add(e)
        }

        this.each(function(e,i,a){
            let t = point.distanceTo(e)
            setterFunc(t, e)
        })
        return ps
    }

    each(caller) {
        return this.points.forEach(caller)
    }

    keep(caller) {
        let e = []
        return this.points.forEach((e,i,a)=> {
            let res = caller(e,i,a)
            if(res !== undefined) {
                r.push(e)
            }
        })

        return e
    }
};



Polypoint.head.mixin('Point', {
    isNaN: {
        value(any=false) {
            let r = 0;
            r += +isNaN(this.x)
            r += +isNaN(this.y)
            if(r==0) { return false }

            if(r > 0) {
                if(any) { return true }
                // two NaNs, is always isNaN == true
                if(r >= 2) { return true }
            }

            return false
        }
        , writable: true
    }
    , distanceTo: {
        value(other) {
            return distance(this, other)
        }
    }

    , distance2D: {
        value(other) {
            return distance2D(this, other)
        }
    }
})


// Polypoint.head.static('Point', {
//     distance: {
//         value(a, b){
//             return Math.hypot(b.x - a.x, b.y - a.y);
//         }
//     }
// })


function distance(xy1, xy2) {
  return Math.sqrt(Math.pow((xy2.x - xy1.x), 2) + Math.pow((xy2.y - xy1.y), 2));
}


function distance2D(xy1, xy2) {
    const dx = xy1.x - xy2.x;
    const dy = xy1.y - xy2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { x: dx, y: dy, distance }
}


/*const*/ approx_distance = function(dx,dy ) {

   if ( dx < 0 ) dx = -dx;
   if ( dy < 0 ) dy = -dy;

    let min = dy;
    let max = dx;
    if(dx < dy) {
        min = dx;
        max = dy;
   }

   let approx = ( max * 1007 ) + ( min * 441 );
   if ( max < ( min << 4 )) {
      approx -= ( max * 40 );
   }

   // add 512 for proper rounding
   return (( approx + 512 ) >> 10 );
}



/*const*/ approx_distance2 = function(dx,dy ) {
   let min, max;

   if ( dx < 0 ) dx = -dx;
   if ( dy < 0 ) dy = -dy;

   if ( dx < dy )
   {
      min = dx;
      max = dy;
   } else {
      min = dy;
      max = dx;
   }

   // coefficients equivalent to ( 123/128 * max ) and ( 51/128 * min )
   return ((( max << 8 ) + ( max << 3 ) - ( max << 4 ) - ( max << 1 ) +
            ( min << 7 ) - ( min << 5 ) + ( min << 3 ) - ( min << 1 )) >> 8 );
}
