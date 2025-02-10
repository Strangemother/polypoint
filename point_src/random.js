

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

        if(max != undefined) {
            return Math.random() * (max - min) + min;
        }

        return Math.random() * min
    }

    string(multiplier=1, rot=32){
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

    color(h=360, s=100, l=100) {
        let deg = random.int(h)
        let sat = random.int(s)
        let lig = random.int(l)
        return `hsl(${deg}deg ${sat}% ${lig}%)`
    }
}


const random = new Random()
Polypoint.head.install('Random')
