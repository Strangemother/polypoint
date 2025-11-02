/*
title: Color Bits Library Example
categories: minimal, color, third-party
files:
    head
    point
    pointlist
    stroke
    stage
    ../point_src/third_party/color-bits.js
---

Minimal example using the color-bits library for high-performance color manipulation.

The color-bits library is included in the head comment and provides a global `colorBits` object
with functions for parsing, formatting, and manipulating colors.

Example usage:
- colorBits.parse('#ff0000') - Parse color strings
- colorBits.rgb(255, 0, 0) - Create RGB colors
- colorBits.format(color) - Format colors as hex strings
- colorBits.toRGBA(color) - Convert to RGBA object

For more information, see: https://github.com/romgrk/color-bits
*/

// Color scheme based on palette
// https://paletton.com/#uid=70q0u0kw0sSkR-+qtw8zVncG5hZ
colorScheme = {
    primary: [
        colorBits.parse('#FF9E59'),  // Light orange
        colorBits.parse('#FF842C'),  // Medium-light orange
        colorBits.parse('#E55F00'),  // Medium orange
        colorBits.parse('#B94D00'),  // Medium-dark orange
        colorBits.parse('#8F3B00'),  // Dark orange
    ],
    secondary1: [
        colorBits.parse('#FFC459'),  // Light gold
        colorBits.parse('#FFB42C'),  // Medium-light gold
        colorBits.parse('#E09400'),  // Medium gold
        colorBits.parse('#B97700'),  // Medium-dark gold
        colorBits.parse('#8F5C00'),  // Dark gold
    ],
    secondary2: [
        colorBits.parse('#4B7386'),  // Light blue
        colorBits.parse('#2B5AA9'),  // Medium-light blue
        colorBits.parse('#0E4299'),  // Medium blue
        colorBits.parse('#0A347B'),  // Medium-dark blue
        colorBits.parse('#06275F'),  // Dark blue
    ],
    complement: [
        colorBits.parse('#3DAF9F'),  // Light teal
        colorBits.parse('#1CA08E'),  // Medium-light teal
        colorBits.parse('#00907C'),  // Medium teal
        colorBits.parse('#007464'),  // Medium-dark teal
        colorBits.parse('#005A4E'),  // Dark teal
    ]
}

class ColorBase {

    constructor() {
        this.palette = new Map
        this.set(this.base())
    }

    base() {
        return {
            primary: '#E55F00'   // Medium orange
            , secondary1: '#E09400' // Medium gold
            , secondary2: '#0E4299' // Medium blue
            , complement: '#00907C' // Medium teal
        }
    }

    set(data) {
        for(let k in data) {
            this.add(k, data[k])
        }
    }

    add(name, color) {
        this.palette.set(name, this.cast(color))
    }

    get(name, parse=true) {
        if(this.palette.has(name) == false) return null
        let v = this.palette.get(name)
        return parse==true? this.format(v): v
    }

    blend(background, overlay, opacity, gamma=1) {
        let _b = this.get(background, 0)
        if(_b == null) _b = background;
        let _o = this.get(overlay, 0)
        if(_o == null) _o = overlay;

        return this.format(colorBits.blend(_b, _o, opacity, gamma))
    }

    darken(name, coefficient) {
        return this.format(colorBits.darken(this.get(name, 0), coefficient))
    }

    lighten(name, coefficient) {
        return this.format(colorBits.lighten(this.get(name, 0), coefficient))
    }

    splitRight(count, background, overlay, gamma=1) {
        return this._split(count, (i, t, a) => this.blend(background, overlay, t, gamma))
    }

    splitDarken(count, name) {
        return this._split(count, (i, t, a) => this.darken(name, t))
    }

    splitLighten(count, name) {
        return this._split(count, (i, t, a) => this.lighten(name, t))
    }

    splitLeft(count, background, overlay, gamma=1) {
        return this._split(count, (i, t, a) => this.blend(background, overlay, 1-t, gamma))
    }

    _split(count, func) {
        let i = 0;
        let r = []
        while(i<count) {
            i++;
            const t = i / count  // Normalize to 0-1 range (9 intervals for 10 colors)
            // const blended = colorBits.blend(this.startColor, this.endColor, t)
            r.push(func(i, t, r))
        };
        return r
    }


    format(v) {
        return colorBits.format(v)
    }

    cast(color) {
        /*
        CSS color string: #xxx, #xxxxxx, #xxxxxxxx, rgb(), rgba(), hsl(), hsla(), color()
         */
        return colorBits.parse(color)
    }
}

const colorBase = new ColorBase;

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.points = PointList.generate.list(20, new Point(40, 0), [100, 100])
        this.points.each.radius = 10
        // let cs = colorBase.splitLeft(this.points.length, 'primary', 'complement', 1)
        // let cs = colorBase.splitRight(this.points.length, 'primary', 'complement', 1)
        // let cs = colorBase.splitLighten(this.points.length, 'primary')
        let cs = colorBase.splitDarken(this.points.length, 'primary')
        this.points.each.color = (p, i) => cs[i]
    }

    draw(ctx) {
        this.clear(ctx)
        this.points.pen.fill(ctx)
    }
}


stage = MainStage.go({ loop: false})
