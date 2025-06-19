/*
title: Random
---

The _random_ class provides a range of methods for producing random values.

The `random` object is instansiated for free:

    const random = new Random()
    // examples
    random.int()
    random.point()


*/

class Random {

    /* The minimum value the _point(value)_ can be, before
    the automatic 'float' method is used over the 'int' method.
    */
    pointIntMin = 2

    int(min=1, max) {
        /* Generate an integer between 0 and the given min.
        Given 1 (default), the result will be either 0 or 1

            random.int(10)
            7
            random.int(50)
            30
            random.int(300)
            220
        */
        if(max != undefined) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        let r = this.float()
        return Number( ~~(r * min) )
    }

    float(min=1, max) {
        /* Generate a decimal number between `0` and `1`.
        Provide a min/max to limit

            random.float()
            random.float(.2, 1)
        */
        if(max != undefined) {
            return Math.random() * (max - min) + min;
        }

        return Math.random() * min
    }

    callOne(functions) {
        /* Given many functions, call one. */
        return selections[this.index(selections)]()
    }

    choice(selections) {
        /* Give many items, return one */
        return selections[this.index(selections)]
    }

    index(selections) {
        /* Given many, return an index */
        return Math.floor(selections.length * Math.random())
    }

    string(multiplier=1, rot=32){
        /* Return a random string */
        return this.radix(this.float(multiplier), rot).slice(2)
    }

    radix(v, rot=32) {
        return v.toString(rot)
    }

    point(multiplier=1, method=undefined) {
        /*
            return a random point(), with the X/Y values set as random*multplier
         */
        if (method == undefined) {
            method = multiplier <= this.pointIntMin ? 'float': 'int'
        }

        let p = new Point(this[method](multiplier), this[method](multiplier))
        return p
    }

    within(point, max=.5) {
        /* Return a random 2D position within the given point.

            within({ x: 100, y: 100, radius: 100})
            {x: 79, y: 50}
        */
        let radius = point.radius * 2
        let width = radius
        let height = radius
        let margin = this.point.radius * 2
        let maxMove = width * max
        let x = point.x
        let y = point.y
        // let x = width * .5
        // let y = height * .5
        let precision = 0
        let halfPi = Math.PI / 180
        let distance = Math.random() * maxMove
        let angle = Math.random() * 360
        let tx = x + distance * Math.sin(halfPi * angle)
        let ty = y + distance * Math.cos(halfPi * angle)
        x = +tx.toFixed(precision)
        y = +ty.toFixed(precision)
        return [x,y]
    }

    xy(multiplier=1) {
        /*return two random values between 0 and 1 multiplied by the given
        value `multiplier`.
        This is similar to the random.point() function, except it only returns
        an object of {x,y}*/
        return {"x":this.float(-multiplier, multiplier), "y": this.float(-multiplier,multiplier)}
    }

    gaussian(mean=0, stdev=1) {
        // Standard Normal variate using Box-Muller transform.

        // https://stackoverflow.com/questions/25582882/
        // javascript-math-random-normal-distribution-gaussian-bell-curve
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }

    polar2D() {
        let theta  = 2 * Math.PI * Math.random();
        let R   = Math.sqrt(-2 * Math.log(Math.random()));
        let x   = R * Math.cos(theta);
        let y   = R * Math.sin(theta);

        return [ x, y ];
    }

    color(h=360, s=100, l=100) {
        /* Return a random `hsl` color string,

            random.color()
            random.color(360, 100, 100)
            random.color(360, [30, 100], [60,100])

        */
        let ri = random.int.bind(random)
        let ia = Array.isArray
        let deg = ia(h)? ri(h[0], h[1]): ri(h)
        let sat = ia(s)? ri(s[0], s[1]): ri(s)
        let lig = ia(l)? ri(l[0], l[1]): ri(l)
        return `hsl(${deg}deg ${sat}% ${lig}%)`
    }
}


const random = new Random()
Polypoint.head.install('Random')


const randomizePoint = function(px, y) {
    /* Perform random() on the X and Y.

    If a point is given, randomize to the _max_ of the given point
    If a single number is given, assume _square_
    If no params are given, discover the stage size.

    Use `Point.random()` for the same form, as a new point

        let p = new Point()
        p.randomize(100, 400)
        p.randomize(100) // 100, 100
        p.randomize(new Point(100, 400)) // 100, 400

    if one of the keys is undefined, no change occurs:

        p.setXY(500,700)
        p.randomize(100, undefined) // 100, 700
        p.randomize(undefined, 400) // 500, 400

        p.randomize(undefined, undefined) // 500, 700 // no change occurs.

    Note; no params will randomize as much as possible (the stage size)

        p.randomize() // 800, 600

    Other features would be nice:

    + random in rect (like stage):

        p.randomize(rect|dimensions)

    + Randomize other values, e.g radius, colors

        p.randomize(['x', 'y', 'radius', 'mass'])

        // randomize x to max 400, radius to max 50
        p.randomize({ x: 400, radius: 50})

    + In the future, the _origin_; randomize relative to a point:

        p.randomize({point, relative: true})

    */

}