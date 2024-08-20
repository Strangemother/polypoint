
const pointArray = function(count=5, distance=10) {
    let res = new PointList
    let f = (i) => point(0, distance*i);
    if(typeof(distance) == 'function') {
        f = distance
    }

    for(let i = 0; i<=count-1; i++){
        let p = f(i)
        res.push(p)
    }

    return res
}


class PointListDraw {

    constructor(list) {
        this.list = list;
    }

    horizonLine(ctx) {
        // Ensure the path restarts, ensuring the colors don't _bleed_ (from
        // last to first).
        let a = this.list[0]
        let b = this.list.last()
        ctx.beginPath();
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
    }

    /* Draw this list as a pointline, provide an init position for an offset. */
    pointLine(ctx, position, eachFunc) {
        // To 'close' the old drawing.
        let pointsArray = this.list
        let a = pointsArray[0]

        ctx.beginPath();
        ctx.moveTo(a.x, a.y)

        let {x, y} = position? position: {x:0, y:0}

        for(let i=1; i < pointsArray.length; i++) {
            let segment = pointsArray[i]
            ctx.lineTo(segment.x + x, segment.y + y);
        }

        // ctx.strokeStyle = 'white'
        // ctx.stroke()
    }

    /* Draw a startline lineTo through all points. */
    line(ctx) {
        return this.pointLine(ctx)
    }
}


class PointListGenerator {

    constructor(parent) {
        this.parent = parent;
    }

    _distanceToPointFunction(distance) {

        let f = (i) => {
            return point(0, distance*i);
        }

        if(isPoint(distance)) {
            /* If the given object is a _point_, each step is
            multiplied. */
            f = (i) => {
                return distance.multiply(i)
            }

            return f
        }

        if(isFunction(distance)) {
            return distance
        }

        return f;
    }

    radius(count, radius, origin) {
        /* Synonymous to:

            randomPoints = PointList.generate.random(pointCount)
            // Alter the positions of all the points, a radius of 100, at a position
            randomPoints.shape.radius(100, point(200,200))
        */
        let res = PointList.generate.random(count)
        res.shape.radius(radius, origin)
        return res

    }

    list(count=5, distance=10, origin=undefined) {
        /*
            Generate a list of points to a _count_.

            PointList.generate.list(100)

        Provide an offset per step:

            PointList.generate.list(100, distance=10)
            PointList.generate.list(100, distance=point(10,10))

        */

        let PointListClass = (this.parent? this.parent.constructor: PointList);
        let res = new PointListClass
        let f = this._distanceToPointFunction(distance)
        for(let i = 0; i<=count-1; i++){
            let p = f(i)
            res.push(p)
        }

        origin && res.offset(origin)
        return res
    }

    random(count, multiplier=100) {
        let R = ()=> Math.random() * multiplier
        const rand = function(index) {
            let i = (10 * (1+index))
            return new Point({x: R(), y: R()})
        }

        return this.list(count, rand)
    }
}


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

        return (new GridTools(this.parent, rowCount, pos))
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


class GridTools {

    constructor(parent, width, pos) {
        this.parent = parent;
        this.width = width;
        this.initPosition = pos;
    }

    /* Return a pointlist of the items within the pseudo grid

        let gridTools = new GridTools(pointList, 10)
        let columnPointList = gridTools.getColumn(gridTools.width-1)
        columnPointList.setMany(DOWN_DEG, 'rotation')

    */
    getColumn(index) {
        if(index<0) {
            /* allow index -1 etc, to reduce from the right. */
            index = this.width + index
        }

        let items = new PointList()
        let modIndex = index % this.width
        for (var i = 0; i < this.parent.length; i+=this.width) {
            let l = this.getRow(i)
            items.push(l[modIndex])
        }

        return items
    }

    getRow(i){
        return this.parent.slice(i, i+this.width)
    }

    /* Splice a segment from the grid in the form of a rectagle*/
    getRect(){}

    /* Given a point, or index, return the siblings of the grid

        `rowCount` or `total` is required
    */
    getSiblings(index, columnCount=this.width, rowCount, total) {
        let rc = rowCount==undefined? columnCount: rowCount
        total = total == undefined? rc * columnCount: total

        const currentRow = Math.floor(index / columnCount)
            , currentColumn = index % columnCount
            , size  = total
            /* Up must step back as many cells as a column*/
            , up    = index - columnCount
            , left  = index - 1
            , right = index + 1
            , down  = index + columnCount
            , res = []
            ;

        // console.log(index, 'up', up, 'left', left, 'right', right, 'down', down)
        const inBounds = (v) => (v >= 0) && (v < total);
        const boundPush = (v) => inBounds(v) && res.push(v);

        boundPush(up);
        boundPush(down);

        // left should be the same column
        let leftCol = left % total;
        let leftRow = Math.floor(left / columnCount);
        (currentRow == leftRow) && boundPush(left);
        // if most right (col ==  total), right cannot be applied.
        (currentColumn != columnCount-1) && boundPush(right);

        return res.sort()
    }

}

class PointListPen {

    constructor(parent) {
        this.parent = parent;
    }

    points(ctx, cb) {
        let defaultF = (x)=>{
            // ctx.beginPath()
            x.draw.arc(ctx)
            // ctx.stroke()
        }
        if(cb == undefined) {
            cb = (x,f)=>f(x)
        }

        this.parent.forEach((x)=>{
            cb(x, defaultF)
        })

    }
    line(ctx) {
        this.parent.draw.line(ctx)
        ctx.stroke()
    }

    indicators(ctx, miniConf={}) {
        /* Synonymous to:

            randomPoints.draw.points(ctx, (item, arcDraw)=>{
                item.project().pen.line(ctx, item, 'red', 1)
                ctx.beginPath();
                arcDraw(item)
                quickStroke('orange', 1)
            })

        */

        let def = {
            line: {color:'red', width: 2}
            , circle: {color:'yellow', width: 1}
        };
        Object.assign(def, miniConf)
        let lc = def.color || def?.line?.color
        let lw = def.width || def?.line?.width
        let cc = def.color || def?.line?.color
        let cw = def.width || def?.circle?.width


        let eachPoint = (item, arcDrawF) =>{
                item.project().pen.line(ctx, item, lc, lw)
                ctx.beginPath();
                arcDrawF(item)
                quickStrokeWithCtx(ctx, cc, cw)
            }

        this.points(ctx, eachPoint)
    }

    fill(ctx, fillStyle, radius=undefined) {
        ctx.beginPath()
        let fs = fillStyle || this.color
        if(fs) {ctx.fillStyle = fs};

        this.points(ctx, (p)=> p.pen.fill(ctx, fs, radius))
        // this.point.draw.arc(ctx, radius)
        // ctx.lineWidth = width == undefined? 1: width

        ctx.fill()
    }

    stroke(ctx) {
        // ctx.stroke()
        this.points(ctx, (p)=> p.pen.stroke(ctx))
    }
}


class LazyAccessArray extends Array {

    // drawClass = undefined
    // penClass = undefined
    // generatorClass = undefined
    // shapeClass = undefined

    get draw() {
        const C = (this.drawClass || PointListDraw)
        return (this._draw || (this._draw = new C(this)))

    }

    get pen() {

        const C = (this.penClass || PointListPen)
        if(this._pen == undefined) {
            Object.defineProperty(this, '_pen', { value: new C(this) })
        }
        return this._pen
        // return (this._pen || (this._pen = new C(this)))
    }

    get generate() {
        const C = (this.generatorClass || PointListGenerator)
        return (this._generator || (this._generator = new C(this)))
    }

    get shape() {
        const C = (this.shapeClass || PointListShape)
        if(this._shape == undefined) {
            Object.defineProperty(this, '_shape', { value: new C(this) })
        }
        return this._shape
    }

    get each() {
        /*
            The _each_ unit is a special accessor for the points, allowing
            the generic editing of points for all items in the array.

            Access a function on every point:

                points.each.rotate(10)
                points.each.rotate(10)

            set a value on every point

                points.each.rotation = 50

         */
        const target = this;


        const handler = {
            set(headTarget, innerProp, value) {
                console.log('Set', innerProp, value)
                target.forEach((p, i, a)=>{
                    p[innerProp] = value // .apply(p, arguments)
                })

            }

            , get(target, prop, receiver) {

                const caller = function eachCaller(values) {
                    console.log('Called', this, this.prop, values)
                    let r = []
                    this.target.forEach((p)=>{
                        let v = p[this.prop].apply(p, arguments)
                        r.push(v)
                    })
                    return r;
                }

                let head = caller.bind({ target, prop })

                const headHandler = {

                    set(headTarget, innerProp, value) {
                        console.log('Set', innerProp, value)
                        target.forEach((p)=>{
                            p[innerProp] = value // .apply(p, arguments)
                        })
                    }

                    , apply(target, thisArg, argsList) {
                        /*
                            target: the head (A bound eachCaller)
                            thisArg: _this_, being the parent proxy
                            argsList: given argument.
                            ---
                            this: the head headHandler
                        */
                        console.log('Call to head', this)
                                // head
                        return target.apply(thisArg, argsList)
                    }
                }


                const proxy = new Proxy(head, headHandler);

                return proxy

                // return Reflect.get(...arguments)
            }
        }

        const proxy = new Proxy(target, handler);
        return proxy;
    }
}

const asPoints = function(items) {
    let res = new PointList;
    for(let item in items) {
        res.push(new Point(items[item]))
    }
    return res
}


class PointList extends LazyAccessArray {

    first() {
        return this[0]
    }

    last() {
        return this[this.length-1]
    }

    getBoundingClientRect() {
        /* return thr bounding box of the point.*/
        return DOMRect.fromRect({
            x: 10
            , y: 10
            , width: 200
            , height: 200
        })
    }

    centerOfMass(type='simple', origin) {
        return centerOfMass[type](this, origin)
    }

    setX(value, key='x') {
        return this.setMany(value, key)
    }

    setY(value, key='y') {
        return this.setMany(value, key)
    }

    setData(data) {
        for(let k in data) {
            this.setMany(data[k], k)
        }
    }

    setMany(value, key) {
        /* Set the X value for all points within the list
        accepts undefined, number, point[x], function */
        if(isPoint(value)) {
            value = point[key]
        }

        let f = value;

        if(!isFunction(value)) {
            f = (e,i,a) => {
                    e[key] = value
                }
        }

        this.forEach((e,i,a)=> {
            return f(e,i,a)
        })
    }

    keyMany(key, value) {
        /* Set the X value for all points within the list
        accepts undefined, number, point[x], function */
        let orig = value
        /* copy the key value from the other*/
        if(isPoint(value)) {
            value = orig[key]
        }

        let f = value;

        if(!isFunction(value)) {
            f = function(e,i,a){
                    return value
                }
        }

        this.forEach((e,i,a)=> {
            return e[key] = f(e,i,a)
        })
    }

    cleanArray(fix=true) {
        let r = []
        this.forEach((x)=>r.push(x.asArray(fix)))
        return r
    }

    offset(value) {
        this.forEach(p=>{
            p.copy(p.add(value))
            // p.rotate(rot)
        })
    }

    rotate(value, point) {
        /* Spin the cluster by a given rotation, around an optional anchor
        If given a single point, the rotation is used.*/
        let rot = isPoint(value)? value.rotation: value
        // console.log('rotation to', rot)
        if(point == undefined) {
            point = this.centerOfMass()
        }

        this.forEach(p=>{
            let target = p
            const res = originRotate(target, point, rot);
            target.x = res[0]
            target.y = res[1]
            // p.rotate(rot)
        })
        // return p
    }

    lookAt(other) {
        this.forEach(p=>{ p.lookAt(other)})
    }


}


function originRotate(target, origin, theta) {
    /*
    Example usage:

        const a = [100, 200];
        const b = [300, 200];
        const theta90 = 90;
        const theta50 = 50;

        const newA90 = originRotate(a, b, theta90);
        const newA50 = originRotate(a, b, theta50);

        console.log('New position for 90 degrees:', newA90);
        console.log('New position for 50 degrees:', newA50);
    */

    // Convert theta to radians
    const thetaRad = theta * (Math.PI / 180);

    // Translate point a to the origin with respect to point origin
    const aPrime = [target[0] - origin[0], target[1] - origin[1]];

    // Apply the rotation matrix
    const aPrimeRotated = [
        aPrime[0] * Math.cos(thetaRad) - aPrime[1] * Math.sin(thetaRad),
        aPrime[0] * Math.sin(thetaRad) + aPrime[1] * Math.cos(thetaRad)
    ];

    // Translate the point back
    const aDoublePrime = [aPrimeRotated[0] + origin[0], aPrimeRotated[1] + origin[1]];

    return aDoublePrime;
}



PointList.generate = new PointListGenerator();
