/*
categories: clock
files:
    head
    pointlist
    point
    mouse
    stage
    ../point_src/random.js
    ../point_src/functions/clamp.js
    dragging
    stroke
    ../point_src/split.js
    ../point_src/clock.js
    ../point_src/easing.js
 */

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.modulo = 60
        this.clockSpeed = -1
        let d = new Date;
        this.simTime = new SimTime(1, 5, 20)
        // this.simTime = new SimTime(d.getHours(), d.getMinutes(), d.getSeconds())

        this.clockHands = PointList.generate.countOf(4)
        this.clockHands[0].copy(this.center).update({ radius: 200, rotation: -90 })

        this.hands = new Hands;

        this.dragging.add(this.clockHands[0])
    }

    draw(ctx){
        this.clear(ctx)

        this.simTime.add(oo6 * this.clockSpeed)

        let  ch = this.clockHands
            , p = ch[0]
            , hp = ch[1] // hour
            , mp = ch[2] // minute
            , sp = ch[3] // second
            , st = this.simTime
            , modulo = this.modulo
            ;

        // hp.xy = mp.xy = sp.xy = p.xy
        ch.each.xy = ch[0].xy

        const out = p.copy()
        out.radius += 25

        hp.radius = out.radius * .45
        mp.radius = out.radius *  .7
        sp.radius = out.radius *  .83

        let pr = p.rotation

        out.pen.circle(ctx, { width: 2, color: 'purple'})

        // this.drawText(ctx,out,p, modulo)
        out.split(60, -Math.PI).forEach((p)=>{
            p.radius = out.radius * .05
            p.pen.line(ctx, null,  'purple', 2)
        })


        // mp.rotation = this.hands.getMinuteHand(pr, st.minute)
        mp.rotation = this.hands.getMinuteHand(pr, st.sweepMinute)
        mp.pen.line(ctx, null,  'green', 3)

        hp.rotation = this.hands.getHourHand(pr, st.hour, st.minute, modulo)
        hp.pen.line(ctx, null, '#880000', 4)

        sp.rotation = this.hands.getSecondHand(pr, st.sweepSeconds)
        sp.pen.line(ctx, null,  '#999', 1)

        this.drawCenter(ctx, out, p)

        let easingFunction = (v) => easingFunctions.quartic.out(easingFunctions.sine.inOut(v))
        sp.rotation = this.hands.getSecondHand(pr, st.seconds, 1000 - st.milliseconds, easingFunction)
        sp.pen.line(ctx, null,  'orange', 2)
    }

    drawCenter(ctx, out, p){
        const c = out.copy().update({radius: p.radius * .05})
        c.pen.circle(ctx, {color: 'orange', width: 4})
        c.pen.fill(ctx, '#111')
    }

    drawText(ctx,out, p, modulo=12){
        let r = p.radius * .06
        let ps = out.update({radius: out.radius - (r * 1)}).split(modulo)
        ps.each.radius = r
        // ps.pen.indicators(ctx, { color: 'white'})
        ctx.fillStyle = 'pink'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        let px = Math.max(r*1, 8)
        ctx.font = `400 ${px}px arial`

        const psl = ps.length

        let mouse = this.clockHands[3].project()
        ps.forEach(function(e,i,a){
            // e.text.fill(ctx, ((psl-1 + i) % psl)+1 )
            e.rotation = p.rotation + 90
            // e.lookAt(mouse)
            // e.rotation += p.rotation + ((12 / psl) * i)
            e.text.plain(ctx, ((psl-1 + i) % psl)+1 )
            // e.text.string(ctx, ((psl-1 + i) % psl)+1 )
            // e.pen.indicator(ctx)
            // e.text.label(ctx, ((psl-1 + i) % psl)+1)
        })

    }
}


;stage = MainStage.go();