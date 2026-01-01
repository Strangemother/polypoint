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
        /* Given many functions, call a random one. */
        return selections[this.index(selections)]()
    }

    choice(selections) {
        /* Select and return a random item from an array.
        
        Use this method to randomly choose one element from a collection of items.
        
            const colors = ['red', 'blue', 'green', 'yellow']
            random.choice(colors)
            // 'green'
            
            const points = [new Point(10, 20), new Point(30, 40), new Point(50, 60)]
            random.choice(points)
            // Point { x: 30, y: 40 }
        */
        return selections[this.index(selections)]
    }

    index(selections) {
        /* Return a random index for the given array.
        
        Use this to get a valid random position within an array's bounds.
        
            const items = ['apple', 'banana', 'cherry', 'date']
            random.index(items)
            // 2
            
            items[random.index(items)]
            // 'banana'
        */
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
        /* Generate a new Point with random x and y coordinates.
        
        Use this to create a random Point instance with coordinates scaled by the multiplier.
        Values ≤2 use floats, larger values use integers by default.
        
            random.point(100)
            // Point { x: 47, y: 83 }
            
            random.point(1)
            // Point { x: 0.234, y: 0.891 }
            
            random.point(500, 'float')
            // Point { x: 234.56, y: 412.89 }
        */
        if (method == undefined) {
            method = multiplier <= this.pointIntMin ? 'float': 'int'
        }

        let p = new Point(this[method](multiplier), this[method](multiplier))
        return p
    }

    shuffle(points, max=1) {
        /* Randomly shuffle all points be a random amount between 0 and a multilper
        of the radius.
        For example if the point is 20px, a `max` of `.5` would plot the center
        of the point anywhere within the full point area. Providing a value of `1`
        (default) would plot within a 40px width and height (circular) area.
        (Math.PI * 2)

        This is because the `max` value computes a percenile of the _radius_ of
        the origin position, resolving anywhere within the diameter area if the point.
        */
        points.forEach(p=>p.xy=this.within(p, max))
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

    gaussianFloat(mean=0, stdev=1) {
        // Standard Normal variate using Box-Muller transform.

        // https://stackoverflow.com/questions/25582882/
        // javascript-math-random-normal-distribution-gaussian-bell-curve
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }

    gaussian(start, end, mean=0, stdev=1) {
        return Math.floor(start + this.gaussianFloat(mean, stdev) * (end - start + 1));
    }

    polar2D() {
        /* Generate random 2D coordinates using polar distribution.
        
        Use this to create randomly distributed points following a normal distribution
        in both x and y dimensions, useful for particle effects and natural scatter patterns.
        
            random.polar2D()
            // [0.8234, -1.2156]
            
            const [x, y] = random.polar2D()
            const point = new Point(centerX + x * radius, centerY + y * radius)
        */
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