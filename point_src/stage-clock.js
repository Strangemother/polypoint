/*
---
title: Stage Clock
---

The stage clock assigns additional `clock` functionality to the Stage, such as an `fps()` method:

    stage = new Stage
    stage.clock.fps() // 59
 */
Polypoint.head.deferredProp('Stage', function clock(){
    // this.setupClock()
    console.log('Setup clock')
    const tickClock = function(ctx) {
        let c = this.clock
        // console.log(c.delta)
        const ts = +(new Date)
        // const ts = Performance.now()

        c.tick += 1
        c.delta = (ts - c.prevStamp)
        c.prevStamp = ts
        return c
    }

    this.onDrawAfter(tickClock.bind(this))

    const clock = {
            tick: -1
            /* The default delta is _one frame_ at 60fps.
            This is later updated - but is required early for mounted _fps_ tests.*/
            , delta: (1000/60)
            , prevStamp: (new Date)
            , get fps() {
                // return 1000 / this.delta
                let r = Math.floor(1000 / (this.delta || 10))

                return r
            }
            , splitSeconds(seconds=1, fps=this.fps) {
                return 1 / (fps * seconds)
            }

            , frameStepValue(seconds=1) {
                /*
                    Derive the correct value to add per frame, to ensure a count
                    the total value at the target count of seconds is equal to 1.

                    let v = frameStepValue(3)
                    // 0.005

                    // Add this value per frame
                    total += v
                    // At 3 seconds, this total == 1

                */
                return this.splitSeconds(seconds)
            }
        }

    return clock
})