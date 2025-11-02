/*
categories: clock
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
    ../point_src/text/beta.js
    ../point_src/clock.js
    ../point_src/curve-extras.js
*/

class MainStage extends Stage {
    // canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.gWidth = 50
        this.count = 20

        let d = new Date;
        this.simTime = new SimTime(d.getHours(), d.getMinutes(), d.getSeconds())

        let p = this.point = this.center.copy().update({ radius: 100 })
        this.hourPoint = this.point.copy()
        this.minutePoint = this.point.copy()
        this.secondPoint = this.point.copy()

        this.dragging.add(this.point)

        this.microValue = 1 / (60 * 1) //1 second
        this.microStep = 0
        this.animatingSeconds = false;
        this.secondsDest = 0
        this.hands = new Hands
    }

    setHourHand(parent, point, hour, minute, modulo=12) {
        // assign the time hour to the point hand in the form of rotation
        point.rotation = this.hands.getHourHand(parent.rotation, hour, minute, modulo)

    }

    setMinuteHand(parent, point, minute=0) {
        point.rotation = this.hands.getMinuteHand(parent.rotation, minute)
    }

    setSecondHand(parent, point, seconds=0) {

        /* Working - no animation*/
        // point.rotation = this.hands.getSecondHand(parent.rotation, seconds)


        const ts = 1
        const tsos = (360/60) * ts

        if(this.animatingSeconds == true) {
            // already doing some animations.
            //  perform an update and continue...
            // let newVal = this.hands.getSecondHand(this.secondsDest || point.rotation , seconds)
            let v = this._secondHandLerp.get(this.microStep)
            const nv = this.secondsDest - tsos
            // console.log(nv.toFixed(3), v.toFixed(3), (nv + v).toFixed(), this.microStep)
            point.rotation = (parent.rotation - ( -v + nv)) % 360
            return
        } else {
            this.secondsDest = this.hands.getSecondHand(
                    (parent.rotation - point.rotation) % 360,
                ts)
        }

        // point.rotation = newVal
        let lerper = this._secondHandLerp

        if(lerper == undefined){
            // create / start
            this._secondHandLerp = new Value(
                            0, //point.rotation,
                            tsos, // newVal,
                            // elasticEaseOut
                            // quinticEaseIn
                            // quadEaseInOut
                            // circularEaseInOut
                            )

            /* Will flag when complete */
            this._secondHandLerp.doneHandler = ()=> {
                this.microStep = 0
                // this.secondsDest = this.hands.getSecondHand(point.rotation, 1)
                // console.log('NEXT', this.secondsDest)
                this.animatingSeconds = false;
            }
        }

        // reset / start
        this.microStep = 0
        this._secondHandLerp.done = false
        this._secondHandLerp.step = 1

        this.animatingSeconds = true;
        // point.rotation = this._secondHandLerp.get(this.microStep)
        // console.log(point.rotation)
        // point.rotation = newVal
    }

    draw(ctx){
        this.clear(ctx)

        this.microStep += this.microValue
        // if(this.microStep > 1) {
        //     this.microStep = 1
        // }

        this.simTime.add(oo6)
        // this.point.rotation -= oo6 * 0

        let p = this.point
            , hp = this.hourPoint
            , mp = this.minutePoint
            , sp = this.secondPoint
            ;
        hp.x = mp.x = sp.x = p.x
        hp.y = mp.y = sp.y = p.y

        hp.radius = p.radius * .45
        mp.radius = p.radius * .7
        sp.radius = p.radius * .8

        let modulo = 12
        const out = p.copy()
        out.radius += 25
        out.pen.circle(ctx, { width: 1, color: 'red'})
        // p.pen.indicator(ctx, { width: 1, color: 'red'})

        this.setSecondHand(p, sp, this.simTime.seconds)
        sp.pen.line(ctx, null,  'red', 1)
        // this.secondPoint.pen.indicator(ctx, { width: 1, color: 'white'})

        this.setMinuteHand(p, mp, this.simTime.minute)
        mp.pen.line(ctx, null,  'green', 3)
        // this.minutePoint.pen.indicator(ctx, { width: 4, color: 'green'})

        this.setHourHand(p, hp, this.simTime.hour, this.simTime.minute, modulo)
        hp.pen.line(ctx, null, '#880000', 4)
        // this.hourPoint.pen.indicator(ctx, { width: 4, color: 'pink'})

        const c = p.copy().update({radius: p.radius * .07})
        c.pen.circle(ctx, {color: '#880000', width: 4})
        c.pen.fill(ctx, '#111')

        let ps = p.split(modulo)
        let r = 10
        ps.each.radius = r
        // ps.pen.indicators(ctx, { color: 'white'})
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `400 ${r*2}px arial`

        const psl = ps.length

        ps.forEach(function(e,i,a){
            e.rotation=p.rotation+90
            e.text.plain(ctx, ((psl-1 + i) % psl)+1 )
            // e.text.string(ctx, ((psl-1 + i) % psl)+1 )

            // e.text.plain(ctx, ((psl-1 + i) % psl)+1 )
            // e.text.fill(ctx, ((psl-1 + i) % psl)+1 )
        })

        // this.line.render(ctx)
        // this.line.split(this.count, 90).pen.indicators(ctx)

        // this.line2.splitInner(this.count, 90).pen.indicators(ctx, {color:'green'})
        // this.line2.render(ctx, {color: 'green'})

        // this.curve.render(ctx, {color: 'green'})
        // this.curve.splitInner(this.count, degToRad(0)).pen.indicators(ctx)

        // this.curve2.render(ctx, {color: 'red'})
        // this.curve2.split(this.count,  0, ctx).pen.indicators(ctx)

    }
}


Polypoint.head.install(MainStage)
;stage = MainStage.go("#playspace");
