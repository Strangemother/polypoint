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

class Hands {

    getHourHand(initRotation, hour, minute, modulo=12) {
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
        return initRotation + r
    }

    getMinuteHand(initRotation=0, minute=0) {

        /* Because polypoint 0 degreee rotation points to the 3oclock,
        we want to move the minute hand back by 15 minutes.

        we add 45 here, because we want to -15 minutes, so we ensure we
        spin around the clock 60-15, to ensure /60 works without minus. */
        let minuteDecimal = minute / 60
        /* Then multiply by a full spin (in 360 degrees) */
        let minutArc = 360 * minuteDecimal
        return (initRotation + minutArc) % 360
    }

    getSecondHand(initRotation=0, seconds=0) {
        /* The second hand only needs the current tick, and we convert it
        to a clock face rotation.  */
        let secondDecimal = seconds / 60;
        let secondArc = 360 * secondDecimal;
        return (initRotation +  secondArc) % 360
    }

    getSecondHandRad(initRadians=0, seconds=0) {
        /* The second hand only needs the current tick, and we convert it
        to a clock face rotation.  */
        let secondDecimal = seconds / 60;
        let secondArc = (Math.PI * 2) * secondDecimal;
        return (initRadians + secondArc)
    }

}