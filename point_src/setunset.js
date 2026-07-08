/*
    The "Set Unset" tool acts similar to the _ctx.save()_ method, by applying
    changes to the context, and then _unsetting_ after usage.

    This allows the _switching_ of a property of the context with `set` and `unset`
    values previously assigned to changed properties are reapplied - essentially _wrapping_
    some drawing with context changes.

        su = new SetUnset({
            lineWidth: 10
        })

        // lineWidth == ...
        su.set(ctx)
        // lineWidth == 10
        su.unset(ctx)
        // lineWidth == ...

    Implement shortcuts:

        class Stroke extends SetUnset {
            getOpts() {
                let supported = new Set([
                    , "lineWidth"
                ])

                let map = {
                    color: 'strokeStyle'
                }
                let functional = {
                    dash: 'lineDashKeyApply'
                }
                return [supported, map, functional]
            }
        }

        st = new Stroke({
            color: 'red'
        })
 */
class SetUnset {

    /* Perform _stroke_ with styling and stoking; but with a convenient
    on/off without using the context switcher. */
    constructor(settings={}) {
        this.settings = settings;
        this._cache = {}
        this.steps = []
        this._enabled = settings.enabled === undefined? true: settings.enabled

        this.onCreate(this.update(settings))
    }

    onCreate(cachedData) {

    }

    update(settings) {
        /* Apply changes for the persistent info*/
        let [o, steps] = this.prepare(settings)
        this.steps = this.steps.concat(steps)
        return Object.assign(this._cache, o)
    }

    getOpts() {

        let props = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype)
        let rawProps = new Set()
        for(let k of props) {
            let v = props[k]
            if(typeof(v) == 'function') {
                continue
            }
            let desc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, k)
            if(desc.set != undefined) {
                rawProps.add(k)
            }
        }

        let sugarProps = {}
        let functionalProps = {}
        return [
            rawProps, {}, {}
        ]
    }

    prepare(settings){
        /*
            when _settings_ to the ctx
            + first check if its a raw prop,
            + else then resolve from the map.
            + keep the last value
            + Apply through the given function
            + accept a optional return function, to call during unset.

            Therefore the stroker has a _state_
            This should occur _early_ such that the _set_ here runs a chain of
            on/off functions in a map.

            Which means:

            1. for each key resolve ctx (real prop map key), on method, off method
            2. store those until _set_
            3. iter on map; calling each func with the ctx and the value
            4. iter off map, calling each with the stored value, reapplying in the func.

         */

        let [
            /* ctx properties of which don't need map adapting, */
            rawProps
            /* Convenience names to real names */
            , sugarProps
            /* Special methods to perform _more than_ a prop key.*/
            , functionalProps
        ] = Object.values(this.getOpts())

        let isRaw = (k) => rawProps.has(k)

        // , dash: 'setLineDash'
        let generalAcceptor = this.genericKeyApply.bind(this)
        let functionalAcceptor = this.functionKeyApply.bind(this)
        let adds = {};
        let steps = [];

        for(let key in settings) {
            let value = settings[key]
            if(isRaw(key)) {
                // Generic set unset.
                adds[key] = {f:generalAcceptor, k: key, v: value}
                continue
            }

            if(key in sugarProps) {
                // sugar; get real and apply generic.
                adds[sugarProps[key]] = {f:generalAcceptor, k: key, v: value}
                continue
            }

            // A custom prop such as lineDash
            if(key in functionalProps) {
                // sugar; get real and apply generic.
                // debugger

                let res = functionalProps[key]
                /* If _prepare_ function, this should return the actual acceptor */
                if(typeof(res) == 'string') {
                    adds[res] = {f:functionalAcceptor, k: key, v: value}
                    continue
                }

                this[res[0]]();
                let ref = {f:functionalAcceptor, k: key, v: value}
                adds[res[1]] = ref

                if(res[2]) {
                    // step func.

                    ref['step'] = res[2]
                    steps.push(res[1])
                }
            }
        }

        return [adds, steps]
    }

    genericKeyApply(ctx, key, newValue) {
        /* Receive a ctx key property (e.g. lineWidth) and apply the newValue

        Return the previously applied value and a function to remove reverse change.
         */
        let existing = ctx[key]
        ctx[key] = newValue
        return { v: existing, f: this.genericKeyRemove.bind(this)}
    }

    genericKeyRemove(ctx, key, newValue){
        /*
        the newValue given is the original value applied to this key, before
        the change occured (the cached value). Therefore the _remove_ is
        identical to the _apply_.
        */
        return this.genericKeyApply(ctx, key,newValue)
    }

    functionKeyApply(ctx, assignment, newValue, key) {
        /* Call upon the `aasignment` function, with the key and value.
        This expects a {f: function,v: value} response */
        try {

            return this[assignment](ctx, key, newValue)
        } catch(e) {
            if(e.name == 'TypeError') {
                let m = `function method does not exist: ${assignment}`
                // e.message = m
            }

            throw e
        }
    }

    set(ctx, settings=this.settings){

        if(!this._enabled) {
            return
        }

        let cacheProps = this.getCacheBeforeApply();

        let keep = {}
        for(let key in cacheProps) {
            /* Iter all the assignments,
            functionally calling each */
            let entry = cacheProps[key]
            let stored = entry.f(ctx, key, entry.v, entry.k, cacheProps)
            keep[key] = stored
        }

        this._applied = keep
    }

    getCacheBeforeApply() {
        return this._cache
    }

    unset(ctx, settings) {
        /*Remove any currently applied styles, by reading the
        cache and performing the reverse. */

        if((!this._enabled) && settings == undefined) {
            return
        }


        let cacheProps = this._applied;

        let keep = {}
        for(let key in cacheProps) {
            /* Iter all the assignments,
            functionally calling each */
            let entry = cacheProps[key]
            let stored = entry.f(ctx, key, entry.v, entry.k, cacheProps)
            // keep[key] = stored
        }
        // ctx.setLineDash([])
    }

    draw() {
        /* a start but probably more dynamic. */
    }

    wrap(ctx, settings, func) {
        /* Wrap the call with a start stop

            wrap(ctx, ()=>{})
            wrap(ctx, settings, ()=>{})
        */
        if(func == undefined) {
            func = settings;
            settings = this.settings;
        }

        this.set(ctx, settings)
        func(ctx)
        this.unset(ctx, settings)
    }

    step() {
        /* A _step_ is required when integrating moving values, such as the
        dash offset animation. */

        let ref = this._cache
        if(!ref){ return }


        for(let name of this.steps) {
            const item = ref[name]
            let funcName = item?.step
            try {
                let f = this[funcName](item)
            } catch(e) {
                if(e.name == 'TypeError') {
                    e.message = `step function "${funcName}" does not exist.`
                }
                throw e
            }

            // this[name].bind(this)()
        }
    }

    off(setDisable=true) {
        // undo any _on_ and _pause_ the _on_ function
        this._enabled = !setDisable
    }

    on(setEnable=true) {
        this._enabled = setEnable
    }

}
