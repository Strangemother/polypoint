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


class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.points = PointList.generate.list(20, new Point(40, 0), [100, 100])
        this.points.each.radius = 10
        // Define start and end colors using the scheme
        this.startColor = colorScheme.primary[2]
        this.endColor = colorScheme.complement[2]

        this.points.forEach((p, i, a) => {
            const t = i / a.length  // Normalize to 0-1 range (9 intervals for 10 colors)
            const blended = colorBits.blend(this.startColor, this.endColor, t)
            p.color = colorBits.format(blended)
        })

    }

    draw(ctx) {
        this.clear(ctx)
        this.points.pen.fill(ctx)
    }
}

stage = MainStage.go({ loop: false})
