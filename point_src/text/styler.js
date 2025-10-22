/*
Apply styling to fonts.

+ font
    Font setting.
    Default value "10px sans-serif".
+ textAlign
    Text alignment setting.
        start (default), end, left, right, center.
+ textBaseline
    Baseline alignment setting.
        top, hanging, middle, alphabetic (default), ideographic, bottom.
+ direction
    Directionality.
        ltr, rtl, inherit (default).
+ letterSpacing
    Letter spacing.
    Default: 0px.
+ fontKerning
    Font kerning.
        auto (default), normal, none.
+ fontStretch
    Font stretch.
        ultra-condensed, extra-condensed, condensed, semi-condensed, normal (default), semi-expanded, expanded, extra-expanded, ultra-expanded.
+ fontVariantCaps
    Font variant caps.
        normal (default), small-caps, all-small-caps, petite-caps, all-petite-caps, unicase, titling-caps.
+ textRendering
    Text rendering.
        auto (default), optimizeSpeed, optimizeLegibility, geometricPrecision.
+ wordSpacing
    Word spacing.
    Default value: 0px

---

All typical properties are supported.

Specials:

    fontWeight, weight
        400
    fontSize, size
        10px
    fontName, name
        Arial
    kerning
    stretch
    spacing
    alignment
        unpacks to [textAlign, textBaseline]

---

f = new FontStyle({
    name: 'lexend deca'
    , size: 22
    , align: [center, center]
})
*/

class FontStyle extends SetUnset {

    getOpts() {
        /* ctx properties of which don't need map adapting, */
        let supported = new Set([
            , "font"
            , "textAlign"
            , "textBaseline"
            , "direction"
            , "letterSpacing"
            , "fontKerning"
            , "fontStretch"
            , "fontVariantCaps"
            , "textRendering"
            , "wordSpacing"
        ])

        /* Convenience names to real names */
        let map = {
            weight: 'fontWeight'
            , size: 'fontSize'
            , name: 'fontName'
            , kerning: 'fontKerning'
            , stretch: 'fontStretch'
        }

        /* Special methods to perform _more than_ a prop key.*/
        let functional = {
            // dash: 'lineDashKeyApply'
            // , lineDash: 'lineDashKeyApply'
            // , march: ['marchKeyPrepare', 'marchKeyApply','marchKeyStep']

            // dash: 'lineDashKeyPrepare'
            // , lineDash: 'lineDashKeyPrepare'
            // , march: 'marchKeyPrepare'
        }

        return { supported, map, functional }
    }

    onCreate(cachedData) {
        /* here we generate a custom entry to build a string when set.*/
        cachedData['fontString'] = {
                f: this.applyFontString.bind(this)
                , k: 'font'
                , v: "{weight} {size} {name}"
            }
    }

    applyFontString(ctx, key, value, k, data) {

        let weight = data.fontWeight?.v
        let size = data.fontSize?.v
        let name = data.fontName?.v

        if(typeof(size) == 'number') {
            size = `${size}px`
        }

        if(name == undefined) {
            name = 'arial'
        }
        let l = `${weight} ${size} ${name}`
        console.log(l)
        let v = ctx[k]
        ctx[k] = l
        return data[key]
    }

    getCacheBeforeApply() {
        return this._cache
    }
}


Polypoint.head.lazierProp('Stage', function fonting() {
    return new FontStyle()
})

Polypoint.head.lazierProp('StagePen', function fonting() {
    return this.parent.fonting
})

