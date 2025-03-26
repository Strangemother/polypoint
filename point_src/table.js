/*
---
title: Table
---

Generate a nested set of objects, given a set of _rows_ and a set of _headers_.


    let keys = [
        "minDistance"
        , "attractionStrength"
        , "repulsionStrength"
        , "damping"
        , "minVelocity"
        , "maxVelocity"
        , "itercount"
        , "method"
    ]

    const confTable = new Table(keys, {
          'default': [30,  0.004, 200, 0.60,  0.1,  5]
        , 'alt':     [90,  0.002, 100, 0.66,  0.08, 5]
        , 'gas':     [100, 0.001, 800, 0.974, 0.1,  9,  1]
        , 'stable':  [100, 0.001, 80,  0.974, 0.01, 9,  1]
        , 'blob':    [90,  0.002, 100, 0.95,  0.1,  20, 1, 'springy']
    })

    const settings = confTable.get('blob')
    {
        minDistance: 90
        , attractionStrength: 0.002
        , repulsionStrength: 100
        , damping: 0.95
        , minVelocity: 0.1
        , maxVelocity: 20
        , itercount: 1
        , method: 'springy'
    }


The `get` method returns an object, with the keys given. If a property from the
row does not exist, the keypair is not assigned to the result.

We can provide defaults for missing keys:

```js
confTable.get('default', { method: 'egg' })
```
*/
class Table {
    constructor(keys, rows, cached=false){
        this.keys = keys
        this.rows = rows
        this.data = undefined
        this.innerData = undefined
        this.cached =  cached
    }

    get(key, defaults=undefined) {
        let obj;

        if(this.data == undefined && !this.cached) {
            obj = this.getRow(key)
        } else {
            obj = this.data[key]
        }

        if(defaults === undefined) {
            return obj
        }

        return Object.assign(defaults, obj)
    }

    getKeys() {
        return Object.keys(this.rows)
    }
    getRow(key) {
        let row = this.rows[key]
        return this.dataRow(row)
    }

    cache() {
        return this.data = this.create.apply(this, arguments)
    }

    create(rows=this.rows, keys=this.keys){
        if(Array.isArray(rows)){
            return this.rowsFromArray(rows, keys)
        }
        return this.rowsFromDict(rows, keys)
    }

    rowsFromDict(rows, keys){
        let res = {}
        for(let key in rows) {
            let row = rows[key]
            res[key] = this.dataRow(row, keys)
        }
        return res
    }

    rowsFromArray(rows, keys){
        let res = []
        for(let key in rows) {
            let row = rows[key]
            let r = this.dataRow(row, keys)
            res.push(r)
        }
        return res
    }

    dataRow(row, keys=this.keys) {
        let d = {}
        let i = 0
        for(let cell of row) {
            d[keys[i]] = cell;
            i++;
        }
        return d
    }
}

Polypoint.head.install(Table)
