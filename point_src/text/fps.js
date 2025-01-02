/* FPS Text view. With builtin debouncer and styling features.

notes:

+ Use auto mounting
+ A tick method
+ a nice class.
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
        if(text){
            this.text = text;
        }

        this.position = new Point(0, 0)
        this.stage = stage;
        let a = new Array(this.width)
        a.fill(0)
        this.ticks = a
    }

    /* Called during prep. */
    setup() {
        this.position.x = 50
        this.position.y = 50
    }

    /* Update is for data. */
    update() {
        let clock = this.stage.clock
            , tick = clock.tick
            , currentFPS = clock.fps
            ;

        if(tick % this.modulusRate == 0) {
            // this.text = currentFPS
            /* A cleaner text output takes the average of a list of fps counts.*/
            this.text = (this.ticks.reduce((a,b) => a+b) / this.width).toFixed(this.fixed)
        }

        this.inc += 1
        if(tick % this.width == 0) {
            this.inc = 0
        }

        this.ticks[this.inc] = currentFPS
    }

    /* Draw is for visual*/
    draw(ctx=this.stage.ctx, color=this.color) {
        // Text.writeText
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