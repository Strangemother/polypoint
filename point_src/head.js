/*

The _head_ represents the library and its accessibles. In the browner this manifests as the
first object to loadout; "Polypoint"
 */

;(function(parent, name='Polypoint', debug=false){

    const dlog = debug?console.log.bind(console): ()=>{}
    const waiting = {}

    /* Install properties onto an incoming unit


        Polypoint.mixin('Point', {

            _draggable: {
                value: true,
                writable: true
            }

            , draggable: {
                get() {
                    return this._draggable
                }
            }
        })

        this.center.draggable == true
        this.center._draggable = false
        this.center.draggable == false
     */
    const mixin = function(target, addon) {
        if(head[target]) {
            dlog(`Installing mixin for "${target}"`)
            populateAddon(target, addon)
            return
        }

        dlog('Mixin Waiting for unit', target)
        if(waiting[target] == undefined) {
            waiting[target] = []

        }

        waiting[target].push(addon)
    }

    const installMap = new Map;

    /* "Install" an entity, allowing the automated mixin population
    And Polypoint calling.

    Note, this isn't required - but without it, the autoloading mechanism
    won't function

        Polypoint.install(Point)
        Polypoint.installed
        { "Point" }

    When applied, we can use mixins:

        Polypoint.mixin('Point', {
            foo: { value: 1000 }
        })

    This can work in any order; late or early.
    */
    const install = function(entity, name=undefined) {
        if(name == undefined) {
            /* Expecting a _thing_ with a name, such as a class; Point */
            name = entity.name
        }

        dlog(`Installing entity "${name}"`)
        head[name] = entity;

        if(waiting[name] != undefined) {
            // loop install
            populateAddons(name, waiting[name])
        }

        /*Install to a map so we can infer later.
            Polypoint.installed
            [...]
        */
        installMap.set(name, entity)
    }

    const populateAddons = function(name, items) {
        dlog('Installing addons', items.length, 'to', name)
        for (var i = 0; i < items.length; i++) {
            populateAddon(name, items[i])
        }
    }

    const populateAddon = function(name, item) {
        dlog('populateAddon', name, item)
        let proto = head[name].prototype.constructor.prototype
        // let proto = Object.getPrototypeOf(head[name])

        // proto[name] = item
        let names = Object.getOwnPropertyNames(item);
        for(let name of names) {
            // define(proto, name, { value: item, writable: false})
            Object.defineProperties(proto, item)
        }
    }

    const define = function(proto, name, def) {
        Object.defineProperty(proto, name, def)
        // Object.defineProperties(proto, name )
    }

    /* Assume many functions to install:

            Polypoint.installFunctions('Point', {
                track(other, settings) {
                    return constraints.distance(other, this, settings)
                }

                , leash(other, settings) {
                    return constraints.within(other, this, settings)
                }
            });

        synonymous to:

        Polypoint.mixin('Point', {
            track: {
                value(any=false) {
                    /// ...
                }
                , writable: true
            }
            , leash: { ... }
        })

     */
    const installFunctions = function(name, functionsDict) {
        let def = {}
        for(let k in functionsDict) {
            let func = functionsDict[k]
            def[k] = {
                value: func
                , writable: true
            }
        }

        return mixin(name, def)
    }


    /*
        Assume many correctly named functions to access values on first call.

        e.g from:

            Polypoint.mixin('Point', {
                pen: {
                    get() {
                        let r = this._pen
                        if(r == undefined) {
                            r = new PointPen(this)
                            this._pen = r
                        }
                        return r
                    }
                }
            })

    to:

        Polypoint.lazyProp('Point', {
            pen() {
                let r = this._pen
                if(r == undefined) {
                    r = new PointPen(this)
                    this._pen = r
                }
                return r
            }
        })

        stage.center._pen == undefined
        stage.center.pen == Pen
        stage.center._pen == Pen
     */
    const lazyProp = function(name, propsDict) {
        let def = {
        }

        for(let key in propsDict) {

            let propName = key
            let val = propsDict[key]

            def[propName] = { get: val }
        }

        return Polypoint.mixin(name, def)
    }

    const head = {
        ready: false
        , mixin, install, installFunctions
        , define
        , lazyProp

        /* Return a map iterator of the installed items.*/
        , get installed() {
            return installMap.keys()
        }

    }

    parent[name] = head;

}).apply({}, [this]);