/*
files:
    pointlistdraw.js
    pointlistgradient.js
    pointlistshape.js
    pointlistgenerator.js
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

    remove(item) {
        /* Remove an item. but this does perform a splice
        so it may be costly.*/
        let i = this.indexOf(item)
        if(i>-1){
            return this.splice(i, 1)
        }

    }
}


Polypoint.head.install(PointList)


PointList.generate = new PointListGenerator();
