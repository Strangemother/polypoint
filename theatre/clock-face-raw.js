/*
title: Clock Face Raw
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
    ../point_src/text/beta.js
    ../point_src/curve-extras.js


 */
const oo6 = 1/60

class SimTime {
    /*
        Sim Time provides an interface for hour, minute, second
        clock additons.

            let st = new SimTime(16, 30, 0)
            st.add(1) // seconds
            st.addHour(-1)
            st.add(100) //seconds
            st.array()
            [15, 31, 41]

     */
    constructor(hour, minute, seconds=0) {
        this.innerOffset = 0
        this._hour = hour
        this._minute = minute
        this._seconds = seconds
        this._cache = this.split(this.innerOffset)
    }

    add(seconds) {
        this.innerOffset += seconds
        this._cache = this.split(this.innerOffset)
    }

    split(secs){
        var hour = Math.floor(secs / (60 * 60));

        var divisor_for_minutes = secs % (60 * 60);
        var minute = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var second = Math.ceil(divisor_for_seconds);

        var obj = {
             hour,
             minute,
             second,
             seconds:second
        };
        return obj;
    }

    get hour(){
        return this._hour + this._cache.hour
    }

    get minute(){
        return this._minute + this._cache.minute
    }

    get seconds(){
        return this._seconds + this._cache.seconds
    }

    set hour(v){
        return this._hour = v
    }

    set seconds(v){
        return this._seconds = v
    }

    set minute(v){
        return this._minute = v
    }

}


class MainStage extends Stage {
    canvas='playspace'
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

        // this.hourPoint.radius = p.radius * .4
        // this.minutePoint.radius = p.radius * .6
        // this.secondPoint.radius = p.radius * .7

        this.dragging.add(this.point)//, ...lpoints, ...lpoints2, ...lpoints3, ...lpoints4)
    }

    setHourHand(parent, point, hour, minute, modulo=12) {
        // assign the time hour to the point hand in the form of rotation

        /*
            Looking at this:
            https://www.omnicalculator.com/math/clock-angle

            Although very comprehesive, I felt they didn't convey the methdology
            easily.

            When looking for inspiration on the quickest methodd, I came across
            this:
            https://www.david-smith.org/blog/2023/11/06/design-notes-46/

            And because of the swift conversion, I couldn't quite make it work
            But the idea is lovely; Just calculate the rotation around the
            clock for both hour and minute, then add them.

            So given that inspiration, we can calculate the hour modulo
            then _add_ the offset for the current minute

            To make it easy, we consider (one hour / 60), then we multiply
            by the count of minutes. We add this as _additional arc rotation_
            on the hour hand.
         */

        /* multiply 1 hour of rotation, by the amount required.

        We minus 3, because in polypoint, 0 degrees is points at 3oclock,
        so we remove that to ensure the hour 0, is _upward_. */
        let m = modulo
        let hourArc = (360/m) * (hour-0)

        /* Convert the amount of minutes, to a percent around the clock.
        minute 30, is 50% around the clock. */
        let minuteDecimal = minute / 60
        /* Covert that (.5) 50%, through one hour of arc.
        The amount travelled through the hour */
        let minutArc = (360/m) * minuteDecimal

        /* Add the two parts, applying a rotation through 360 degrees to
        the hour hand. */
        let r = (hourArc + minutArc) % 360
        point.rotation = parent.rotation + r
    }

    setMinuteHand(parent, point, minute=0) {

        /* Because polypoint 0 degreee rotation points to the 3oclock,
        we want to move the minute hand back by 15 minutes.

        we add 45 here, because we want to -15 minutes, so we ensure we
        spin around the clock 60-15, to ensure /60 works without minus. */
        let minuteDecimal = minute / 60
        /* Then multiply by a full spin (in 360 degrees) */
        let minutArc = 360 * minuteDecimal
        point.rotation = (parent.rotation + minutArc) % 360
    }

    setSecondHand(parent, point, seconds=0) {
        /* The second hand only needs the current tick, and we convert it
        to a clock face rotation.  */
        let secondDecimal = seconds / 60;
        let secondArc = 360 * secondDecimal;
        point.rotation = (parent.rotation +  secondArc) % 360
    }

    draw(ctx){
        this.clear(ctx)

        this.simTime.add(oo6)
        // this.point.rotation -= oo6 * 24

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
            // e.text.plain(ctx, ((psl-1 + i) % psl)+1 )
            // e.text.fill(ctx, ((psl-1 + i) % psl)+1 )
            e.rotation=p.rotation+90
            e.text.plain(ctx, ((psl-1 + i) % psl)+1 )
            // e.text.string(ctx, ((psl-1 + i) % psl)+1 )
            // e.text.label(ctx, ((psl-1 + i) % psl)+1)
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


;stage = MainStage.go();