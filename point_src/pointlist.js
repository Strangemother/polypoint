/*
files:
    unpack.js
 */

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


const asPoints = function(items) {
    let res = new PointList;
    for(let item in items) {
        res.push(new Point(items[item]))
    }
    return res
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

    stroke(ctx) {
        // ctx.stroke()
        let args = arguments;
        this.list.forEach((p)=> p.draw.stroke.apply(p.draw, args))
    }

    circle(ctx, radius=undefined, color, width) {
        let args = arguments;
        this.list.forEach((p)=> p.draw.circle.apply(p.draw, args))
        // return this.stroke.apply(this, arguments)
    }

    /* Draw this list as a pointline, provide an init position for an offset. */
    pointLine(ctx, position, eachFunc) {
        // To 'close' the old drawing.
        let pointsArray = this.list
        let a = pointsArray[0]
        if(!a) { return }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y)

        let {x, y} = position? position: {x:0, y:0}

        for(let i=1; i < pointsArray.length; i++) {
            let segment = pointsArray[i]
            ctx.lineTo(segment.x + x, segment.y + y);
        }

        // ctx.strokeStyle = 'white'
    }

    /* Draw a startline lineTo through all points. */
    line(ctx) {
        return this.pointLine(ctx)
    }

    quadCurve(ctx, loop=false, position){
        let pointsArray = this.list;
        let prevPoint = pointsArray[0];
        position = position? position: prevPoint
        let numPoints = pointArray.length;
        let p0 = pointsArray[numPoints - 1] || position;
        let _p2 = prevPoint;
        let strength = .5
        if(p0 ==  undefined) {return}
        ctx.beginPath();
        let min1 = prevPoint
        if(loop) {
            // ctx.moveTo(200, 200);
            min1 = pointsArray.last()
        }

        ctx.moveTo( (p0.x + min1.x) * strength, (p0.y + min1.y) * strength );
        // ctx.moveTo( (p0.x + prevPoint.x) * strength, (p0.y + prevPoint.y) * strength );
        for(let i = 1; i < pointsArray.length; i++) {

            let currPoint = pointsArray[i];
            var xc = (prevPoint.x + currPoint.x) * strength;
            var yc = (prevPoint.y + currPoint.y) * strength;
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
            prevPoint = currPoint;
        }

        /* Draw to the last point. */
        var xc = (prevPoint.x + prevPoint.x) * strength;
        var yc = (prevPoint.y + prevPoint.y) * strength;

        if(loop) {
            xc = (prevPoint.x + _p2.x) * strength;
            yc = (prevPoint.y + _p2.y) * strength;
        }

        if(loop!=2){
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
        }
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

    countOf(count) {
        /* Genrate a count of points, without editing the values. */

        let PointListClass = (this.parent? this.parent.constructor: PointList);
        let res = new PointListClass
        for(let i = 0; i<=count-1; i++){
            let p = new Point;
            res.push(p)
        }
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

    random(count, multiplier=100, offset={x:0, y:0, radius: 0, rotation: 0}) {
        /*Generate a set of random points

            PointList.generate.random(10)

        Apply a multipler and offset:

            let count = 20
            let multiplier = [300, 200, null, 0]
            let offset = [100, 100, 10, 0]

            PointList.generate.random(count, multiplier, offset)

         */
        let multiplierP = new Point(multiplier)
        let offsetP = new Point(offset)
        let R = (w)=> Math.random() * multiplierP[w]

        let doRads = multiplierP.radius != null
        let doRotation = multiplierP.rotation != null

        const rand = function(index) {
            /* Fundamental options.*/
            const opts = {
                x: offsetP.x + R('x')
                , y: offsetP.y + R('y'),
            }
            /* Optonal edits. If null, they're not applied.*/
            doRads && (opts['radius'] = offsetP.radius + R('radius'))
            doRotation && (opts['rotation'] = offsetP.rotation + R('rotation'))
            return new Point(opts)
        }

        return this.list(count, rand)
    }

    grid(pointCount, rowCount, pointSpread, gridPosition) {
        let d = unpack0(arguments, {
            count: null
            , rowCount: 10
            , spread: undefined
            , position: undefined
        })

        let points = this.list(d.count)
        let spread = d.spread
        let pos = d.position

        if(spread==undefined) {
            spread = d.count;
        }

        if(pos == undefined){
            pos = {x: spread, y: spread}
        }

        this._gridTool = points.shape.grid(spread, d.rowCount, pos)
        return points;
    }

    getGridTool(rowCount, pos) {
        if(this._gridTool == undefined) {
            this._gridTool = new GridTools(this.parent, rowCount, pos)
        }

        return this._gridTool
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

    subdivide(split=1, mutate=true) {
        /* Subdivide all cells within the grid by the given `split` integer.
        This adds up to 5 points to divide a _quad_ into 4 equal quads.

        if `mutate` is true, the new points are inserted into the grid, accounting
        for the row count offset.

        If mutate is false, return the new points.

            points = PointList.generate.grid(16, 4, 50)
            points.getGridTool().subdivide(1, true)
            // points.length == 40
        */

    }


    /* Given a point, or index, return the siblings of the grid

        `rowCount` or `total` is required
    */
    getSiblings(index, columnCount=this.width, rowCount, total, expand=false) {
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
            , res = {}
            // , res = []
            ;

        // console.log(index, 'up', up, 'left', left, 'right', right, 'down', down)
        const inBounds = (v) => (v >= 0) && (v < total);
        const boundPush = (n, v) => {
            if(inBounds(v)) {
                res[n] = v
                // res.push(v)
            }};

        boundPush('up', up);
        boundPush('down', down);

        // left should be the same column
        let leftCol = left % total;
        let leftRow = Math.floor(left / columnCount);
        (currentRow == leftRow) && boundPush('left', left);
        // if most right (col ==  total), right cannot be applied.
        (currentColumn != columnCount-1) && boundPush('right', right);

        if(expand) {
            return res;
        }

        return Object.values(res).sort()
    }

    getSiblings8(index, columnCount = this.width, rowCount, total) {
        // If rowCount is not given, assume a square grid rowCount == columnCount
        const rc = (rowCount == null) ? columnCount : rowCount;
        // If total is not given, it is rc*columnCount by default
        total = (total == null) ? rc * columnCount : total;

        const currentRow    = Math.floor(index / columnCount);
        const currentColumn = index % columnCount;
        const res           = [];

        // Offsets in the range -1 to 1, excluding (0, 0).
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
              // Skip the origin cell itself.
              if (rowOffset === 0 && colOffset === 0) continue;

              const newRow    = currentRow    + rowOffset;
              const newColumn = currentColumn + colOffset;

              // Check that the new coordinates are within the grid boundaries.
              if (newRow >= 0 && newRow < rc && newColumn >= 0 && newColumn < columnCount) {
                const neighborIndex = newRow * columnCount + newColumn;
                // Also ensure this index is within the total number of cells.
                if (neighborIndex >= 0 && neighborIndex < total) {
                  res.push(neighborIndex);
                }
              }
            }
        }

        return res.sort((a, b) => a - b);
    }
}


class LazyAccessArray extends Array {

    // drawClass = undefined
    // penClass = undefined
    // gradientClass = undefined
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

    get gradient() {
        const C = (this.gradientClass || PointListGradient)
        if(this._gradient == undefined) {
            Object.defineProperty(this, '_gradient', { value: new C(this) })
        }
        return this._gradient
    }

    get generate() {
        const C = (this.generatorClass || PointListGenerator)
        if(this._generator == undefined) {
            Object.defineProperty(this, '_generator', { value: new C(this) })
        }
        return this._generator
    }

    get shape() {
        const C = (this.shapeClass || PointListShape)
        if(this._shape == undefined) {
            Object.defineProperty(this, '_shape', { value: new C(this) })
        }
        return this._shape
    }

    siblings(close=false) {
        /* Return in sibling pairs, where each node is paired with its neighbour
        for every item. Each node appears twice:

            [a,b,c,d,e,f,g]
            pairs()
            a,b
            b,c
            c,d
            d,e
            e,f
            f,g

        example:

            myitems.siblings().map(pair=>[pair[0].uuid, pair[1].uuid]);
        */
        let r = []
            , l = this.length;

        for (var i = 0; i < l; i++) {
            let to = this[i+1]
            if(to==undefined) {continue}
            let v = new PointList(this[i], to)
            r.push(v)
        }

        if(close) {
            let v = new PointList(this[l-1], this[0])
            r.push(v)
        }

        return r
    }

    pairs(close=false) {
        /* Return in pairs, where each node is paired with its next neighour once.
        Each node appears once:

            [a,b,c,d,e,f,g]
            pairs()
            a,b
            c,d
            e,f

        example:

            myitems.pairs().map((b)=>b[0].uuid);

        */
        let r = []
            , l = this.length;

        for (var i = 0; i < l-1; i+=2) {
            let v = new PointList(this[i], this[i+1])
            r.push(v)
        }

        if(close) {
            let v = new PointList(this[l-1], this[0])
            r.push(v)
        }
        return r
    }

    triples() {
        /*
        Return a list with points in triplets, where each entry has 3 points

            [a,b,c,d,e,f,g]
            triples()
            a,b,c
            b,c,d
            c,d,e
            d,e,f
            e,f,g
            f,g,a
            g,a,b
         */
        const triples = [];
        const len = this.length;
        for (let i = 0; i < len; i++) {
            triples.push(new PointList(
                        this[i % len]
                        , this[(i + 1) % len]
                        , this[(i + 2) % len]
                    ));
        }
        return triples;
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
                // console.log('Set', innerProp, value)
                let innerV = value
                if(!isFunction(innerV)) {
                    innerV = ()=> value
                }

                target.forEach((p, i, a)=>{
                    p[innerProp] = innerV.apply(p, [p, i, a])
                })

                return true
            }

            , get(target, prop, receiver) {

                const caller = function eachCaller(values) {
                    // console.log('Called', this, this.prop, values)
                    let r = []
                    let previouslyCalled = undefined;
                    let isCaller = function(v){
                        if(previouslyCalled) {
                            return previouslyCalled
                        }
                        previouslyCalled = isFunction(v)
                    }

                    this.target.forEach((p)=>{

                        let v = p[this.prop]
                        if(isCaller(v)){
                            v = v.apply(p, arguments)
                        }
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

                    , get(headTarget, innerProp, _proxy) {
                        console.log('Get', innerProp, _proxy)

                        let fs = {
                            array: ()=> {
                                let r = []
                                target.forEach((p)=>{ r.push(p[prop]) })
                                return r
                            }
                        }

                        return fs[innerProp]//() // _proxy
                    }
                    , next(){
                        console.log('next')
                    }
                    , [Symbol.iterator] () {
                        console.log('iterator')
                        return stage.points
                    }

                    , apply(target, thisArg, argsList) {
                        /*
                            target: the head (A bound eachCaller)
                            thisArg: _this_, being the parent proxy
                            argsList: given argument.
                            ---
                            this: the head headHandler
                        */
                        // console.log('Call to head', this)
                                // head
                        return target.apply(thisArg, argsList)
                    }
                }


                const proxy = new Proxy(head, headHandler);
                // return Reflect.get(...arguments)
                return proxy
            }
        }

        const proxy = new Proxy(target, handler);
        return proxy;
    }
}


class PointList extends LazyAccessArray {

    first() {
        return this[0]
    }

    last() {
        return this[this.length-1]
    }

    copy(deep=false) {
        /* Copy:

            stage.points.copy() == stage.points
            false
            stage.points.copy()[0] == stage.points[0]
            true

        Deep Copy:

            stage.points.copy(true) == stage.points
            false
            stage.points.copy(true)[0] == stage.points[0]
            false
        */
        let pl = new PointList;
        if (deep == true) {
            this.forEach(p=>{
                pl.push(p.copy())
            })
        }

        return  pl.concat(this)
    }

    getBoundingClientRect() {
        /* return thr bounding box of the point.*/
        return DOMRect.fromRect(this.getSize())
    }

    getSize() {
        /* Return the width/height of the pointlist, discovering the _min_
        and _max_ points to determin a rectangle */

        let x = 0
            , y = 0
            , min = this[0]
            , max = {x,y}
            ;

        this.forEach((p)=>{

            if(p.x < min.x) { min.x = p.x };
            if(p.y < min.y) { min.y = p.y };

            if(p.x > max.x) { max.x = p.x };
            if(p.y > max.y) { max.y = p.y };
        })

        return {
            x: min.x
            , y: min.y
            , width: max.x - min.x
            , height: max.y - min.y
            , min, max
        }
    }

    cast(type=Point, func) {
        /* mutate each point with the given.
        Similar to map(p=>new Cast(p))
        */
        if(func == undefined)  {
            func = function(p){
                return new type(p)
            }
        }
        return this.map(p=>func(p))
    }

    centerOfMass(type='simple', origin) {
        return centerOfMass[type](this, origin)
    }

    get center() {
        let size = this.getSize()
        let x = (size.width * .5)
        let y = (size.height * .5)
        // let z = size.z * .5
        return new Point(size.x + x, size.y + y)
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

    getById(id){
        for(let p of this) {
            if(p._id == id) {
                return p
            }
        }
    }

    getByName(name) {
        return this.getByKey('name', name)
    }

    getByKey(key, value) {
        for(let x of this){
            if(x[key] == value){
                return x
            }
        }
    }

    update(data) {
        this.forEach((e,i,a)=> {
            return e.update(data)
        })
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
            let va = p.add(value)
            p.x = va.x
            p.y = va.y
            // p.copy(p.add(value))
            // p.rotate(rot)
        })
    }

    rotate(value, point) {
        /* Spin the cluster by a given rotation, around an optional anchor
        If given a single point, the rotation is used.*/
        if(point == undefined && isPoint(value)) {
            this.handleRotate(value)
        }

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

    handleRotate(handlePoint) {
        let rot = handlePoint.radians

        this.forEach(target=>{
            const res = originRotate(target, handlePoint, rot);
            target.x = res[0]
            target.y = res[1]
            // p.rotate(rot)
        })
    }


    everyEvery(func) {
        /*
        Iterate every point against every point.
        This is useful for point to point connection

            points.everyEvery(function(a,b){
            })
        */
        const points = this;
        // let points = Array.from(pointMap.values())
        let complete = new Set();

        points.forEach((e,i,a)=>{
            points.forEach((f,j)=> {
                if(e.uuid == f.uuid) { return }
                let v = e.iid + f.iid
                if(complete.has(v)) {
                    return
                }
                complete.add(v)
                // e.pen.line(ctx, f)
                func(e,f)
            })
        })
    }

    lookAt(other) {
        this.forEach(p=>{ p.lookAt(other)})
    }

    grow(point=undefined) {
        /* shift the points within the list as per a growth method.
        If is a list of 2, the line will extend,
        If more than 2, the points will push away from the origin point.
        If the origin is undefined, the COM is used.*/
    }

    sortByRadius(){
        this.sort((a,b)=>b.radius-a.radius)
    }

    sortByZ(){
        this.sort((a,b)=>b.z-a.z)
    }

}


class PointListGradient {

    constructor(parent) {
        this.parent = parent;
    }

    linear(ctx) {
        /* use the points to generate a gradient.

        1. from start to end points
        2. each position must contain a 'color'
        3. Distance to each stop between 0/1
        */

        let parent = this.parent;
        let prev = parent[0]

        let distances = [[0, prev.color]];
        let total = 0;
        let round = Math.round;

        for (var i = 1; i < parent.length; i++) {
            let distance = round(parent[i].distanceTo(prev))
            distances.push([distance, prev.color])
            total += distance
            prev = parent[i]
        };

        let stops = []
        let running = 0
        for (var i = 0; i < distances.length; i++) {
            let v = distances[i]
            let dis = v[0]
            let r = (dis / total)
            let stop = Number((r + running).toFixed(4))
            stops.push([stop, v[1]])
            running += r
        }

        let a = parent[0]
        let b = parent.last()
        let gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        for (var i = 0; i < stops.length; i++) {
            let stop = stops[i]
            gradient.addColorStop(stop[0], stop[1]);
        }
        return gradient;
    }
}


Polypoint.head.install(PointList)
Polypoint.head.install(PointListGradient)
Polypoint.head.install(PointListGenerator)


PointList.generate = new PointListGenerator();
