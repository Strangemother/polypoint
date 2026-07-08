

class PointListShape {
    /* Shape an existing Array, editing points _in place_. */

    constructor(parent) {
        this.parent = parent;
    }

    get length(){
        return this.parent.length
    }

    linear(spread, keys=['x'], altValue=undefined, altKeys=['x','y']) {
        /*  order the items in a flat linear list. Spread across the key axis.
        If the altValue is undefined, the _other_ position key is not changed.

            // Spread across X by 20 per step. Y becomes 100 for each.
            pointList.shape.linear(20, 'x', 100)

            // diagonal, the altValue is not useful here:
            plRandom.shape.linear(20, ['x', 'y'])
        */

        if(typeof(keys) == 'string') {
            keys = [keys]
        }

        let doAlt = altValue != undefined;
        let items = this.parent
        let eachFunc = function(e,i,a){
            for(let k of keys) {
                e[k] = spread * i
            }

            if(!doAlt) {
                return
            }

            for(let k of altKeys) {
                // we don't alt change this key
                if(keys.indexOf(k) > -1) {
                    continue
                }
                e[k] = altValue;
            }
        }
        items.forEach(eachFunc)
    }

    random(multiplier=100) {
        /* move all points to a random position within a space. */
        let items = this.parent
        let R = ()=> Math.random() * multiplier

        items.forEach((e, i, a)=>{
            //i = (10 * (1+i))
            e.x = R()
            e.y = R()
            return e
        })

        return items
    }

    grid(spread, rowCount=10, pos) {
        /* Distribute across a plane, similar to linear, but with a reset
        stepper.


        spread of 50, with 5 per row, drawing from position[0]:
            plRandom.shape.grid(50, 5);

        Set the position then draw:

            plRandom[0].set(50,50)
            plRandom.shape.grid(50, 6);

        Spread of 30, with 6 items per row, at a position:

            plRandom.shape.grid(30, 6, point(100,100));

        */
        let items = this.parent
        pos = pos || items[0].copy()
        items.forEach((e, i, a)=>{
            e.x = pos.x + ( spread * (i % rowCount))
            e.y = pos.y + ( Math.floor(i / rowCount) * spread )
        })

        return new GridTools(this.parent, rowCount, pos)
    }

    radial(point, radius){
        /* "Radial" plots the points around the a given point.
        Unlike "circle" or "radius" of which draw from an origin,

        This method rotates around the origin.

        if the given point is undefined, the center of the point list is used.
        If radius is undefined, the point radius is used.
        */
       /// not implemented.
       throw Error('NotImplemented')
    }

    radius(radius, pos) {
        /* Return a list of points distrubuted evenly around a circle.

        If the position is not given, the fist point in the array is used.
        Notably this may cause the circle to _march_ for every render.

            plRandom.shape.radius(50);
            plRandom.shape.radius(50); // moves to the _new_ x
            plRandom.shape.radius(50); // moves to the _new_ x

        Apply a position to pin the circle at a location:

            plRandom.shape.radius(50, point(100,100));
            plRandom.shape.radius(50, point(100,100)); // does not march

            // follow mouse
            plRandom.shape.radius(50, Point.mouse.position);
        */
        const items = this.parent;
        pos = pos || point(items[0]).copy()
        radius = radius == undefined? pos.radius: radius;
        // let {x, y} = pos.add(radius);

        // let res = [
        //     point(x + radius * Math.cos(0), y +  radius *  Math.sin(0))
        // ]

        const count = items.length
        const c2pi = Math.PI2 / count

        for(let i = 0; i <= count-1; i++) {
            let i2pic = i * c2pi;
            let p = items[i]
            p.x = radius * Math.cos(i2pic) + pos.x
            p.y = radius * Math.sin(i2pic) + pos.y
            // let p = point();
            // res.push(p)
        }

        // return res
    }
}
