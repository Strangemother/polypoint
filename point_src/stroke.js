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
        ctx.setLineDash(newValue)
        return {v: existing, f: this.lineDashKeyRemove, k:k }
    }

    lineDashKeyRemove(ctx, key, cachedValue) {
        /* To remove the line dash we call setLineDash with the inverse of the
        previously applied value `cachedValue`. */
        ctx.setLineDash(cachedValue)
        return cachedValue
    }

}


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
