/*
Convert your points to (and from) JSON.

    (new Point).toJSON()

For a list of points:
    let listStr = stage.gearBox.points.toJSON()
    stage.gearBox.points.fromJSON(listStr)

The `fromJSON` returns a new list. To mutate in place, apply `mutate=true`

    stage.gearBox.points.fromJSON(listStr, true)

when mutating, additional points (from the json string) are created and applied
immediately. For example, if the target pointlist has 4 points,
applying a listStr of 6 points will generate 2 new points.

---

    let points = new PointList(
          [20, 40, 23 ]
        , [30, 30, 200, 30]
        , [10, 20, 200, 30]
    ).cast()
    let s = points.toJSON()
    points.fromJSON(s, true)
 */

Polypoint.head.installFunctions('Point', {
    toJSON() {
        /* By default the Point.toJSON return the array value. */
        return this.asArray()
    }
})


Polypoint.head.installFunctions('PointList', {
    toJSON() {
        // console.log('Store to JSON', this)
        let output = []
        this.forEach((p)=>{
            let d = p.toJSON()
            output.push(d)
        })
        return JSON.stringify(output)
    }

    , fromJSON(text, mutate=false) {
        let output = JSON.parse(text)
        if(!mutate) {
            return PointList.from(output).cast()
        }

        return this.fromUnpacked(output)
    }
    , fromUnpacked(content) {

        for (var i = 0; i < this.length; i++) {
            let definition = content[i]
            this[i].copy(Point.from(definition),1)
        }

        let extra = content.length - this.length

        if(extra == 0) {
            return this
        }

        console.log('Adding', extra, 'items')

        let createFunc = (d)=> new Point(d)

        if(isFunction(mutate)){
            createFunc = mutate
        }

        for (var i = 0; i < extra; i++) {
            let definition = content[i + this.length]
            console.log('Installing', this.length + i, definition)
            this.push(createFunc(definition))
        }
    }

    , toLocalStore(name) {
        localStorage[name] = this.toJSON()
    }
    , fromLocalStore(name, mutate=true) {
        let v = localStorage[name];
        if(v){
            return this.fromJSON(v, mutate)
        }
    }
})


Polypoint.head.staticFunctions('PointList', {
    fromJSON(text) {
        let output = JSON.parse(text)
        return PointList.from(output).cast()
    }

    , toJSON(pointList) {
        return pointList.toJSON()
    }
})
