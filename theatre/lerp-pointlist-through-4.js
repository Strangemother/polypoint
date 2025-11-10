/*
title: PointList Lerp with Custom Easing
categories: lerp
files:
    head
    pointlist
    point
    stage
    mouse
    stroke
    ../point_src/random.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
    ../theatre/apple-motion-algo.js
---

In this example, we use the `PointList.lerper.through(a, b)` but all node
delays and timing are slightly altered.

We also edit the last node to be _late_ (for fun.)
*/

class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 80
        this.a = PointList.generate.random(count, [300,300, 2, 200], [60, 150, 0, 1])
        // this.a = PointList.generate.grid(count, ~~Math.sqrt(count), 20, new Point(300, 300))
        // this.a.each.x = this.center.x
        // this.a.each.y = this.center.y
        // this.b = PointList.generate.grid(count, ~~Math.sqrt(count), 20, new Point(300, 300))
        this.b = PointList.generate.radius({
                        count: count
                        , multiplier: [0, 0, 0, 0]
                        , offset: {radius:5}
                    }, 140, this.center.copy()
                )
        this.c = PointList.generate.random(count)
        this.c.each.color = ()=>random.color([220, 221], [70, 94], [40, 80])

        let s = this.persistentLerperSettings = {
            seconds: 4
            // , easing: this.customEasing({ oscilation: [0,1]})
            , easing: exponentialEaseInOut
            // , easing: bounceEaseOut
            // , easing: elasticEaseOut
            // , easing: backEaseOut
            // , 10: this.createChunk()
            , randomizeShape: {
                delay: [0,3]
                , seconds: [3,6]
            }
        }

        this.c.lerper.setup(s)

        // let one = s[40]
        // one.delay = 3.5
        // one.easing = quadEaseOut
        // one.seconds = .7
        // one.currentTime = -(one.delay/one.seconds)
        // let delay = 6.5
        // let easing = this.customEasing({ oscilation: [1,2], anticipation: [.3,.5]})
        // let seconds = .4
        // Object.assign(one, this.c.lerper.genChunk(seconds, delay, easing))

    }

    customEasing(shape){
        let fl = function(pair, defaultPair) {
            if(pair == undefined){pair=defaultPair}
            return random.float(pair[0], pair[1])
        }

        let anticipation = fl(shape.anticipation, [.1, .2])
            , midpoint = fl(shape.midpoint, [.6, 0.8])
            , oscilation = fl(shape.oscilation, [3,4])
            , damping = fl(shape.damping, [2, 8])
            , defaultEasing = (t) => stepMotion(t, anticipation, midpoint, oscilation, damping)
            ;

        return defaultEasing
    }

    draw(ctx) {
        this.clear(ctx)

        // this.a.pen.indicator(ctx, 'green')
        // this.b.pen.indicator(ctx, {color:'#333'})

        this.c.lerper.through(this.a, this.b, this.persistentLerperSettings)
        // this.c.pen.indicator(ctx, {color:'purple'})
        this.c.pen.fill(ctx)
    }
}


Polypoint.head.installFunctions('PointListLerper', {
    /* PointList lerper randomise addons, allowing the _settings_ and composition
    of randomize seconds and delays per node. */

    setup(settings={}) {
        /* store the settings into the lerper instance.

        This is required if the settings are randomised, as the _currentTime_
        for each unit is stored uniquely. If the storage of that object is
            not persistent, the updates wont persist though draw cycles.
        */
        this._settings = settings
        if(settings.randomizeShape){
            this.randomizeDelays(settings.randomizeShape, settings)
        }
    }

    , randomizeDelays(randomizeShape=this._settings.randomizeShape, settings=this._settings) {
        /* For each point in the list, call createChunk, with the given settings. */
        this.parent.forEach((e, i)=>{
            settings[i] = this.createChunk(randomizeShape || settings.randomizeShape)
        })
    }

    , createChunk(shape={}) {
        /* Geenrate a single unit chunk for `seconds` and `delay`.
        The currentTime of each object must be stored persistently (e.g. not an object
        in draw), else the currentTime is never advanced.
        */
        let fl = function(pair, defaultPair) {
            if(pair == undefined){pair=defaultPair}
            return random.float(pair[0], pair[1])
        }

        let delay = fl(shape.delay, [0, 2])
            , seconds = fl(shape.seconds, [2.9, 4.4])
            , easing = shape.easing// ==undefined? defaultEasing: shape.easing
            ;

        return this.genChunk(seconds, delay, easing);
    }

    , genChunk(seconds, delay, easing){

        return {
            // easing: { x: exponentialEaseInOut, y: bounceEaseOut }
            // easingX: exponentialEaseInOut
            easing
            , seconds
             , delay: delay
             , currentTime: -(delay / seconds)
        }
    }

});

;stage = MainStage.go();