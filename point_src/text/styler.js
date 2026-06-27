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


class StageTypeface {
    /* Allow the appliance of font styles on the stage.

        stage.typeface.name = 'arial'
        stage.typeface.size = 40
        stage.typeface.weight = 500

    object:

        stage.typeface.update({
            name: 'arial'
        })

    ---

    + fontFamily
    + fontSize
    + fontWidth
    + fontStyle
    + fontVariant
    + fontWeight
    + lineHeight

        // font-size font-family
        font: 1.2em sans-serif;

        // font-size/line-height font-family
        font: 1.2em/2 "Fira Sans", sans-serif;

        // font-style font-weight font-size font-family
        font: italic bold 1.2em monospace;

        // font-width font-variant font-size font-family
        font: ultra-condensed small-caps 1.2em Montserrat, Helvetica, sans-serif;

        // system font
        font: caption;

    The value is either a shorthand specifying the various font-related properties or a single <system-font-family-name> keyword:

        'font-style'
        See the font-style CSS property. Defaults to normal.

        font-variant-css2
        Either the normal or small-caps value of the font-variant property.
        Defaults to normal.

        'font-weight'
        See the font-weight CSS property.
        Defaults to normal.

        font-width-css3
        The keywords supported by the font-width CSS property.
        Defaults to normal.

        'font-size'
            See the font-size CSS property.

        'line-height'
        See the line-height CSS property.
        Defaults to normal.

        'font-family'
        See the font-family CSS property.
        Must be the last value.

        <system-font-family-name>
        A single keyword representing a system font, including:

            caption
            The system font used for captioned controls (buttons, drop-downs, etc.).

            icon
            The system font used to label icons.

            menu
            The system font used in menus (e.g., dropdown menus and menu lists).

            message-box
            The system font used in dialog boxes.

            small-caption
            The system font used for labeling small controls.

            status-bar
            The system font used in window status bars.

            There are several non-standard values implemented with prefixes.

    textAlign
    textBaseline

    */

    constructor(parent) {
        this.parent = parent
        this.fontSettings = {}
        this.defaultFontMeasurement = 'em'
    }

    load(fontName='Lexand Deca') {
        /*
        https://developer.mozilla.org/en-US/docs/Web/API/FontFace
        */
        let url = "url(x)"
        let f = new FontFace(fontName, url);
        f.load().then(() => {
          // Ready to use the font in a canvas context
          this.name = fontName
        });
    }

    addSetup(name, props) {
        /* define an entire fontface, settable through this.setNamed(name)
        */
    }

    set(props) {
        /* Apply a dict.*/
        for(let k in props) {
            this.setProp(k, props[k])
        }
    }

    setProp(key, v) {
        let d = this.fontSettings
        this._dirty = v != d[key]
        d[key] = v
    }

    set name(v){
        let key = 'fontFamily'
        this.setProp(key, v)
    }

    set family(v){
        /* Set the font family. Similar to setting a name,
        but more conguent to the applied reference.  */
        let key = 'fontFamily'
        this.setProp(key, v)
    }

    set size(v){
        /* if number, cast as str. */
        let key = 'fontSize'
        if(typeof(v) == 'number') {
            let fm = this.defaultFontMeasurement;
            v = `${v}${fm}`
        }

        this.setProp(key, v)
    }

    set width(v){
        /* if number, cast as str. */
        let key = 'fontWidth'
        this.setProp(key, v)
    }

    set style(v) {
        let key = 'fontStyle'
        this.setProp(key, v)
    }

    set variant(v) {
        let key = 'fontVariant'
        this.setProp(key, v)
    }

    set weight(v) {
        let key = 'fontWeight'
        this.setProp(key, v)
    }

    set height(v) {
        let key = 'lineHeight'
        this.setProp(key, v)
    }
}


const stageTypefaceProxy = function(parent) {

    const unknownAttrProxyHandler = {
        get(target, prop, receiver) {

            if(target[prop] !== undefined) {
                // return target[prop].apply(target, arguments)
                return Reflect.get.apply(target,arguments);
            }
            console.log('Return receiver')

            return target.receiverFunction(prop)
        }
    };

    const target = new StageTypeface(parent)
    const eventNameHandlerProxy = new Proxy(target, unknownAttrProxyHandler);
    return eventNameHandlerProxy;
}



Polypoint.head.lazierProp('Stage', function typeface() {
    const target = new StageTypeface(parent)
    return target;
    // return stageTypefaceProxy(this)
})


Polypoint.head.lazierProp('Stage', function fonting() {
    return new FontStyle()
})


Polypoint.head.lazierProp('StagePen', function fonting() {
    return this.parent.fonting
})

