Polypoint.head.deferredProp('Stage', function clock(){
    // this.setupClock()
    console.log('Setup clock')
    const tickClock = function(ctx) {
        let c = this.clock
        const ts = +(new Date)
        // const ts = Performance.now()
        c.tick += 1
        c.delta = ts - c.prevStamp
        c.prevStamp = ts
        return c
    }

    this.onDrawAfter(tickClock.bind(this))

    const clock = {
            tick: -1
            , delta: 0
            , prevStamp: +(new Date)
            , get fps() {
                return Math.floor(1000 / this.delta)
            }
        }

    return clock
})

