/*
title: FPS
files:
    smooth-number.js
---

FPS Text view. With builtin debouncer and styling features.

When loaded, an instance is applied to the stage:

    class FPSExample extends Stage {
        draw(ctx){
            this.step()
            this.clear(ctx)

            // Call the function
            this.fps.drawFPS(ctx)

            // continue drawing stuff.
            this.center.pen.indicator(ctx, { color: 'gray', width: 1})
            this.mouse.point.pen.indicator(ctx, { color: 'green', width: 1})
        }
    }

It's automounted on the stage for free or you can create a new instance:

    stage.fps
*/

class FPS extends TextAlpha {
    color = 'green'
    // Higher is a longer delay between visual text updates.
    modulusRate = 10
    // Count of position to store historical fps counts.
    width = 20
    // decimal accuracy. Generally 0 is preferred.
    fixed = 0

    constructor(stage, text=undefined) {
        super()
        this.stage = stage;
        if(text){
            this.text = text;
        }
        this.position = new Point(0, 0)
        this.smoothVal = new SmoothNumber(this.stage.clock.fps, this.width, this.modulusRate, this.fixed)
        this.text = this.smoothVal
    }

    setup() {
        /* Called during prep. */
        this.position.x = 40
        this.position.y = 30
    }

    update() {
        /* Update is for data.

            drawFPS(ctx) {
                t = new FPS(stage)
                t.update()
                t.draw(ctx, color)
            }
        */
        this.smoothVal.pushGet(this.stage.clock.fps)
        // this.text = this.smoothVal.pushGet(Math.round(this.stage.clock.fps)+1)
    }

    draw(ctx=this.stage.ctx, color=this.color) {
        /* Draw is for visual*/
        this.writeText(color, ctx)
    }
}

Polypoint.head.install(FPS)


class FramerateExt {
    // tools to extend the stage.
    constructor(stage) {
        this.label = new FPS(stage)
        this.label.setup()
    }

    drawFPS(ctx) {
        let t = this.label
        t.update()
        t.draw(ctx, this.color)
    }
}

// Polypoint.head.installFunctions('Stage', {
//     drawFPS(ctx) {
//         let t = this.fpsLabel
//         t.text = this.clock.fps
//         t.writeText('red', ctx)
//     }
// });


Polypoint.head.lazierProp('Stage', function fps(){
    return new FramerateExt(this)
})