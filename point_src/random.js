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
