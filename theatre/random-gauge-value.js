/*
files:
    ../point_src/core/head.js
    ../point_src/point-content.js
    pointlist
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/functions/clamp.js
    ../point_src/text/beta.js
    ../point_src/functions/rel.js
---
The _red_ gauge presents a raw `Math.random()`. The _green_ gauge presents
a random with a calculated bias, to correct the long-term drift of a random
function.

Over time you'll see the unbiased gauge slowly drift away from a zero summation, where the
biased gauge always tends towards zero.
 */


class MainStage extends Stage {
    canvas = 'playspace'

    /*
        Update speed of 1 is fastest.
    */
    updateSpeed = 1
    mounted(){
        let a = this.a = (new Point(this.center)).update({radius: 200, y: rel(-50)})
        let b = this.b = this.a.copy().update({y: rel(100)})
        this.modu = 0

        b.total = a.total = 0
        /*
        The Bias pushes the _needle_ in a preferred direction.
        In theory .5 is _no bias_ But the -1 to 1 may natually walk away
        from the bias.

        On _my machine_ this bias tends to negative at `.4999`,
        and tends to positive at `.49999`. So a heustic _nudge_ may be prudent.
        */
        b.bias = a.bias = .5
        b.biasOffset = a.biasOffset = .00001

        this.dragging.add(this.a, this.b)

        console.log('Mount')
        addControl('updateSpeed', {
            field: 'range'
            , label: 'update speed'
            , step: 1
            , max: 200
            , stage: this
            , onchange(ev) {
                /*slider changed. */
                // debugger;
                let sval = ev.currentTarget.value
                this.stage.updateSpeed = parseInt(Math.sqrt(sval)*2)
            }
        })
    }

    draw(ctx) {
        this.clear(ctx)
        this.modu += 1
        this.modu % this.updateSpeed == 0 && this.updateWalkers(1, .5)

        // this.a.pen.fill(ctx, '#222255')
        ctx.fillStyle = '#eeddcc'
        ctx.font = 'normal 20px Courier New'

        let b = this.b;
        b.pen.indicator(ctx)
        let t1 = `${b.total.toFixed(1)}\n${b.biasOffset.toFixed(3)}`
        b.text.string(ctx, t1)

        let a = this.a;
        a.pen.indicator(ctx, {color: 'red'})
        let t = `${a.total.toFixed(1)}\n${a.biasOffset.toFixed(3)}`
        a.text.string(ctx, t)
    }

    roll(p){
        return (-1 + Math.random()) + (.5 + Math.random()) - p.bias - p.biasOffset
    }

    lesserRoll(){
        /* The more _pure_ form of random tends to drift into positive.
        */
        return -.5 + Math.random()
    }

    updateWalkers(iterationLimit=1, max=1) {
        let correction = .00001
        let a = this.a
        let b = this.b

        let r = this.lesserRoll()
        a.total += r
        a.biasOffset += a.total * correction
        a.rotation += (1 * r)

        let r2 = this.roll(b)
        b.total += r2
        b.biasOffset += (b.total * correction) * (Math.sqrt(correction ?? 1)*1000)
        b.rotation += (1 * r2)
    }

}


stage = MainStage.go(/*{ loop: true }*/)
