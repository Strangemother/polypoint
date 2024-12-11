/*
---
title: Coupling
---

Bind the values of a point with another point.
Provide a relative offset object.

    coupling = new Coupling()
    coupling.couple(a, b, { x: 10, y: 10})

Both points are reative to their coupled position:

    // Dragging either point will result in constant coupling.
    dragging.add(a, b)
 */
class Coupling {

    constructor() {
        this.pairs = new Set
    }

    couple(a, b, offset, keys=['x', 'y', 'radius', 'rotation']) {
        /*
        Couple two points, binding the x,y,radius,rotation
        Apply a relative offset to update the values between binding changes

        when a side is manipulated, the _other_ side is updated.
        If B is the altered value, the relativeOffset is applied inversly.

        Apply a function to the relative offset key to capture live change.s
        */

        if(offset == undefined) {
            // {x: 0, y: 0, radius: 0, rotation: 0}
            offset = {}
            keys.map(k=>offset[k]=0)
        }

        const copy = (origin, cacheObj) => {
            /* Copy a dictionaries keys from B into A.
                copy(from, to)
            */
            for(let key in offset) {
                cacheObj[key] = origin[key]
            }
            return cacheObj
        }

        /* an item to install into the future tests*/
        this.pairs.add({
            a, b, offset
            , aCache: copy(a, { dirty: true })
            , bCache: copy(b, { dirty: true })
        })
    }

    step(){
        /* Perform a single _step_ of the coupling test,
        if either side of the connection has changed, bubble the update
        to its sibling - through the relative conversion. */


        const perform = function(changes,
                                primary, primaryCache,
                                secondary, secondaryCache,
                                func
                            ){
            /* The perform function is called by the each pair _twice_, for
            both sides of a coupling, providing a list of keys (`changes`) to
            assign updates.

            This is called only if a value stores in the cache differs to
            the current value on a point.
             */
            changes.forEach((key, i) => {
                /* Install the current primary value into its cache.
                and apply the value to the second entity, also applying
                its new value to its cache,
                */
                const av = primary[key]
                primaryCache[key] = av
                secondaryCache[key] = secondary[key] = func(key, av)
            });
        }

        /* A Test of a single item. */
        const eachFunc = item => {

            let a = item.a
                , b = item.b
                , offset = item.offset
                , aCache = item.aCache
                , bCache = item.bCache
                ;

            perform(this.hasChanged(a, aCache)
                    , a, aCache
                    , b, bCache
                    , (key, value) => {
                            return value + offset[key];
                        }
                    )

            perform(this.hasChanged(b, bCache)
                    , b, bCache
                    , a, aCache
                    , (key, value) => {
                            return value + -offset[key];
                        }
                    )
        }

        this.pairs.forEach(eachFunc)
    }

    hasChanged(a, aCache) {
        /* Given an object and its _cache_, test each key in the _cache_
        and return a Set of changed keys

            hasChanged({foo: 20, bar: 10}, {foo: 10, bar: 10})
            ['foo']

        The return keys are values that do not match _a_.
        If the cache is flagged _dirty_, all keys are returned.

            hasChanged({foo: 20, bar:10}, {foo: 20, bar: 10, dirty: true})
            ['foo', 'bar']

        If no changes are detected `undefined` is returned.

            if(this.hasChanged({}, {})) {
                // is not called.
            }
        */
        let res = new Set;
        if(aCache.dirty) { return Object.keys(aCache) };
        for(let key in aCache) {
            if(a[key] != aCache[key]) {
                res.add(key)
            }
        }

        return (res.size == 0)? undefined: res;
    }

}


class LockedCoupling {

    constructor() {
        this.pairs = new Set
    }

    couple(a, b, offset, keys=undefined) {
        /*
        Couple two points, binding the x,y,radius,rotation
        Apply a relative offset to update the values between binding changes

        when a side is manipulated, the _other_ side is updated.
        If B is the altered value, the relativeOffset is applied inversly.

        Apply a function to the relative offset key to capture live change.s
        */

        if(keys == undefined) {
            //['x', 'y', 'radius', 'rotation']
            keys = Object.keys(offset)
        }

        if(offset == undefined) {
            // {x: 0, y: 0, radius: 0, rotation: 0}
            offset = {}
            keys.map(k=>offset[k]=0)
        }

        const copy = (origin, cacheObj) => {
            /* Copy a dictionaries keys from B into A.
                copy(from, to)
            */
            for(let key of keys) {
                cacheObj[key] = origin[key]
            }
            return cacheObj
        }

        /* an item to install into the future tests*/
        this.pairs.add({
            a, b, offset, keys
            , aCache: copy(a, { dirty: true })
            , bCache: copy(b, { dirty: true })
        })
    }

    step(){

        const perform = function(changes,
                                primary, primaryCache,
                                secondary, secondaryCache,
                                func
                            ){
            changes.forEach((key, i) => {
                /* Install the current primary value into its cache.
                and apply the value to the second entity, also applying
                its new value to its cache,
                */
                const av = primary[key]
                primaryCache[key] = av
                secondaryCache[key] = secondary[key] = func(key, av)
            });
        }
        /* A Test of an item */
        const eachFunc = item => {

            let a = item.a
                , b = item.b
                , offset = item.offset
                , aCache = item.aCache
                , bCache = item.bCache
                ;
            perform(this.hasChanged(a, aCache)
                    , a, aCache
                    , b, bCache
                    , (key, value) => value + offset[key]
                    )

            perform(this.hasChanged(b, bCache)
                    , b, bCache
                    , a, aCache
                    , (key, value) => value + -offset[key]
                    )
        }

        this.pairs.forEach(eachFunc)
    }

    hasChanged(a, aCache) {
        /* Given an object and its _cache_, test each key in the _cache_
        and return a Set of changed keys

            hasChanged({foo: 20, bar: 10}, {foo: 10, bar: 10})
            ['foo']

        The return keys are values that do not match _a_.
        If the cache is flagged _dirty_, all keys are returned.

            hasChanged({foo: 20, bar:10}, {foo: 20, bar: 10, dirty: true})
            ['foo', 'bar']

        If no changes are detected `undefined` is returned.

            if(this.hasChanged({}, {})) {
                // is not called.
            }
        */
        let res = new Set;
        if(aCache.dirty || isNaN(aCache.dirty)) {

            /* Here we flag _zero_ rather than delete or undefined
            to denote that dirty is false without extra steps. */
            aCache.dirty = 0
            return Object.keys(aCache)
        };

        for(let key in aCache) {
            if(a[key] != aCache[key]) {
                res.add(key)
            }
        }

        return (res.size == 0)? undefined: res;
    }

}