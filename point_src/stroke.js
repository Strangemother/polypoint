// const drawPointLine = function(pointsArray, position) {
//     // To 'close' the old drawing.
//     ctx.beginPath();

//     let {x, y} = position
//     for(let i=0; i < pointsArray.length-1; i++) {
//         let segment = pointsArray[i]
//         ctx.lineTo(segment.x + x, segment.y + y);
//     }

//     ctx.strokeStyle = 'white'
//     ctx.stroke()
// }

const UNSET = {}


const quickStroke = function(color='green', lineWidth=UNSET, f) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }

    f && f()

    ctx.stroke()
}


const quickStrokeWithCtx = function(ctx, color='green', lineWidth=UNSET, f) {
    ctx.strokeStyle = color
    if(lineWidth != UNSET) {
        ctx.lineWidth = lineWidth
    }

    f && f()

    ctx.stroke()
}


class Stroke extends SetUnset {

    getOpts() {
        /* ctx properties of which don't need map adapting, */
        let supported = new Set([
            "strokeStyle"
            , "lineWidth"
            , "lineCap"
            , "lineJoin"
            , "lineDashOffset"
        ])

        /* Convenience names to real names */
        let map = {
            color: 'strokeStyle'
            , style: 'strokeStyle'
            , offset: 'lineDashOffset'
            , width: 'lineWidth'
            , cap: 'lineCap'
            , join: 'lineJoin'
        }

        /* Special methods to perform _more than_ a prop key.*/
        let functional = {
            dash: 'lineDashKeyApply'
            , lineDash: 'lineDashKeyApply'
            , march: ['marchKeyPrepare', 'marchKeyApply','marchKeyStep']
            // dash: 'lineDashKeyPrepare'
            // , lineDash: 'lineDashKeyPrepare'
            // , march: 'marchKeyPrepare'
        }

        return { supported, map, functional }
    }

    march(delta=1) {
        /* Performing a dashoffset (if applied)

        This is simply a more specific _step_ function
        */
       this._march += delta
    }

    marchKeyPrepare() {
        if(this._march == undefined) {
            this._march = 0
        }
        // return this.marchKeyApply.apply(this, arguments)
    }

    marchKeyStep(ref){
        this._march += ref.v
    }

    marchKeyApply(ctx, key, newValue) {
        /* The given key should be the "march" param, and the calue applied
        within the setup. Apply marching ants by applying the internal stepper
        value as the lineDashOffset.
        */

        let v = this._cache?.lineDashKeyApply.v
        if(v) {
            this._march %= v.reduce((a,b)=>a+b)
        }

        return this.genericKeyApply(ctx, 'lineDashOffset', this._march)
    }

    lineDashKeyApply(ctx, key, newValue, k) {
        let existing = ctx.getLineDash()
        try {

            ctx.setLineDash(newValue)
        }catch(e) {
            if(typeof(newValue) == 'number') {
                console.warn('dash property should be of type Array: [1]')
            }
            throw e
        }
        return {v: existing, f: this.lineDashKeyRemove, k:k }
    }

    lineDashKeyRemove(ctx, key, cachedValue) {
        /* To remove the line dash we call setLineDash with the inverse of the
        previously applied value `cachedValue`. */
        ctx.setLineDash(cachedValue)
        return cachedValue
    }

}


class StageStrokeMap {
    /*
     Create and and manage Strokes, using a name.

        const fooStroke = stage.strokes.create('foo',{
                        dash: [3,3]
                        , color: 'grey'
                        , width: 2
                    })

    Call set to apply, unset to unapply:

        fooStroke.set(ctx)
        fooStroke.set()

        fooStroke.set(ctx)
        fooStroke.unset()

    Fetch the same stroker:

        let fooStroke = stage.strokes.get('fooStroke')

    Or call the stroke object directly:

        stage.strokes.fooStroke.set()
        stage.strokes.fooStroke.unset()

    Call 'set' on the stroke object to perform the same as above:

        stage.strokes.set('line')
        stage.line.render(ctx)
        stage.strokes.unset('line')

    Run in place, immediately enabling the stroke styles:

        let off = stage.strokes.line()
        stage.line.render(ctx)
        off()

    Or for less code, provide a function to the immediate caller, to run inline:

        // set 'line'
        // run the given function
        // unset 'line'
        stage.strokes.line(()=>stage.line.render(ctx))

     */


    constructor(stage) {
        this.stage = stage;
        this.cache = new Map
    }

    get(name) {
        return this.cache.get(name)
    }

    has(name) {
        return this.cache.has(name)
    }

    create(name, options) {
        let stroke = new Stroke(options)
        this.cache.set(name, stroke)
        return stroke
    }

    set(name, ctx=this.stage.ctx) {
        let stroke = this.get(name)
        stroke.set(ctx)
        return stroke
    }

    unset(name, ctx=this.stage.ctx) {
        let stroke = this.get(name)
        stroke.unset(ctx)
        return stroke
    }

    remove(name) {
        let stroke = this.get(name)
        this.cache.delete(name)
        return stroke
    }

    delete(name) {
        return this.remove(name)
    }

    propHook(prop) {
        /* Given a name (and potentially options), return a handler of
        which can be a function.
        The handler returns a _off_ function for disabling this same stroke. */
        return (func)=> {
            this.set(prop)
            if(func) { func() }
            let unsetHook = ()=>{
                return this.unset(prop)
            }

            if(func) {
                return unsetHook()
            }
            return unsetHook
        }
    }
}

Polypoint.head.deferredProp('Stage', function strokes() {
        /* Return an instance of the Strok map object for the stage.
        This returns a proxy of the instance, providing access to the special calling methods.
        */
        let item = new StageStrokeMap(this)

        /* This hansler is designed to check for the property name given to the stroke map.
        If the name is a stroke name (within the map), return the prop hook, a function
        to enable to the named stroke.

        This allows:

            stage.strokes.line(()=>renderFunc(ctx))

        over:

            var stroke = stage.strokes..get('line')
            stroke.set()
            renderFunc(ctx)
            stroke.unset()

        */
        let handler = {
            get(target, prop, receiver) {
                if(item.has(prop)) {
                    // console.log("stroke prop", target, prop, receiver)
                    return item.propHook(prop)
                }

                return Reflect.get(...arguments)
            }
            , count: ()=> item.map.size()
        }
        let proxy = new Proxy(item, handler)
        return proxy
})

Polypoint.head.install(Stroke)


const example = function() {

    s = new Stroke({
        name: 'customName'

        // ctx identical
        , strokeStyle: '#color'
        , lineWidth: 1
        , lineCap: 'miter'
        , lineJoin: 'miter'
        , lineDashOffset: 0

        // functional special
        , lineDash: [3, 3]

        // custom function special
        , march: .03 // A dash stroke addon per step (march * delta)
        // sugar
        , dash: 'lineDash'
        , color: 'red'
        , style: '#color'
        , offset: 0
        , width: 3
        , cap: 'miter'
        , join: 'miter'
    })

    s = new Stroke(style, width, dash, offset, cap, join)

    s = new Stroke({
        dash: [3,3]
        , color: 'grey'
        , width: 2
    })

    s.set(ctx)
    s.unset(ctx)

}
