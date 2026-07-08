/*
---
title: Timeline with Keyframes
categories: timeline
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/easing.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/functions/clamp.js
    ../point_src/stage.js
    ../point_src/iter/lerp.js

Run a Timeline, with key events.

 */

/*

Note: I'm unhappy with this. It's too clunky and
complicated with a bug limiting the animation steps
---

A timeline should have keyframes -

    tl = new Timeline()
    tl.add(100, KeyFrame())

The keyframe has a lerpy value steped by the timeline stepper.

    tl.play()

functionally, any key value should be manipulatable.

a keyframe is a function executor.
The timeline has steps. at ~60fps.

The timeline manages time stepping, frame slotting (ordering),
and a intermediate values cache

The keyframe is dedicated to a Point, and its _frame_ values, and a curve method.

The timeline will meet a keyframe and initiate the key values,
set those values on the respective point
and step, resetting the lerp value

    timeline.step() => 50
        point.x = 100

    timeline.step() => 51
        compute line lerp to next.
        set x

---

It should only lerp <_from_ - _to_> - therefore if the keyframe does not exist
before the step time, the timeline does not lerp to the next keyframe.

Instead, the first keyframe "activates" the value, allowing lerping to occur.
If a user wants to lerp into an position, the keyframe should be applied before (e.g index 0).

---

A timeline has a cycle method to apply how the timeline will end and restart

In `cycle` mode, the timeline restarts at 0.

    A -> B -> A -> B  ...

`bounce` reverses the timeline as it hits end and start forever

    A -> B -> B -> A  ...

`reverse` reverse the timeline as it hits end and stop at frame 0

    A -> B -> B -> A

`stop` will end the animation at the last keyframe.

    A -> B

--

this infers a _limit_ to the timeline. By default, it's the _last frame_, however this can be
set to a target, such as 500. Cycling through the exact number.
Animations will end and wait accordindgly.

 */

class OrderedMap extends Map {
    /* A map with _next_ method for numerical keys */

    getNextFrame(){}
}

class Timeline {

    constructor(stage) {
        this.stage = stage
        /* Store a num to a keyframe.*/
        this.numMap = new Map

        this.tickFunction = ()=>{}
        this.ticks = 0
        this.running = false
        /* The value per running step to apply.*/
        this.tickValue = 1
        this.steppers = {}
        console.log('Steppers created;')
    }

    add(index, keyFrame) {

        let existing = this.numMap.get(index)

        if(existing == undefined) {
            existing = new Set;
            this.numMap.set(index, existing)
        }

        existing.add(keyFrame)

    }

    perform(ctx) {
        /* Run _perform_ at every draw, performing a step if enabled */
        this.tickFunction.call(this, arguments)
    }

    step() {
        this.ticks += this.tickValue

        // Every step checks to see an activation.
        // Running keys should be lerped to the value.

        // Discover and produce values for current step
        const discovered = this.numMap.get(this.ticks)
        if(discovered) {
            console.log('Found KeyFrame for tick', this.ticks)
            for(let keyFrame of discovered)  {
                // lerping values should be initiated.
                const target = keyFrame.target
                keyFrame.valueMap.forEach((value, key, a)=>{
                    /* This key should be set at this value.*/
                    target[key] = value
                    let nextFrame = this.stackNextFrame(keyFrame)
                })
                // Value()
            }
        }
        // lerp existing.
        this.lerpExisting(this.ticks)
        // This means any previously lerping values will _set_ to the new
        // discovery. Luckily this start value should be (nearly) the same as
        // the concurrent lerping value.
        //
        // When setting a value - the _next_ step is computed through the
        // lerper; A cached Value is stored and iterated per step.
        //
    }

    lerpExisting(ticks) {
        let steppers = this.steppers;
        for(let k in steppers) {
            let entry = steppers[k]
            if(entry === undefined) {
                continue
            }

            let lerper = entry.lerper;
            let relTicks = ticks - entry.delta
            let width = entry.deltaTo - entry.delta
            // let width = lerper.width()
            let oneBit = 1 / width
            let along = oneBit * relTicks
            let newValue = lerper.get(along)

            entry.frames[0].target[entry.key] = newValue
        }

    }

    stackNextFrame(keyFrame, delta=this.ticks) {
        /* Return the next frame applicable to this keyFrame, specfic to
        its point and keys.

        This is used for the value lerping from an existing key value to the
        next discovered.

        If a _next frame_ is found with the same target
        but not the same keys, target next frame is not applicable.

        All keyframes are iterated until a next key for the target is found,
        if no next frame is found, nothing is returned.
        */

        // Look at keyframes _after_ this time delta.
        //  // get all sets from the nummap > delta.
        let m = this.numMap

        /* Keys we want to lerp.
        If a wanted key is undiscovered, it doesn't lerp
            - having no end state, makes it the end state
            - this has already been set, when the keyframe was discovered.
        */
        let wantedKeys = new Set(keyFrame.valueMap.keys())

        // targets[wantedKey] = keyFrameItem
        /* A place to stash found lerp frames*/
        let targets = {}

        m.forEach((valueSet, deltaKey, i)=>{
            if(deltaKey <= delta) {
                return
            }

            // keep any item in the set with the same target
            valueSet.forEach((keyFrameItem)=>{
                if(keyFrameItem === keyFrame) {
                    /* don't check the same frame (note: this will change)*/
                    return
                }

                if(keyFrameItem.target !== keyFrame.target) {
                    /* ignore other targets*/
                    return
                }

                // pop the discovered keys from the items tested
                console.log('Found potential next at', deltaKey)
                let hasKeys = new Set(keyFrameItem.valueMap.keys())

                wantedKeys.forEach((wantedKey) => {
                    if(!hasKeys.has(wantedKey)) {
                        /* No matching target keys*/
                        return
                    }

                    /* this keyframe for this target
                    does have a matching key,
                    therefore we can lerp to this value. */
                    // debugger;
                    wantedKeys.delete(wantedKey)
                    targets[wantedKey] = {keyFrameItem, deltaKey}
                })

            })

        })

        // discover all next.

        // Create lerpy values from _existing_ key value to target key value,
        // over the perform of [distance A & B]
        const res = {}
        /* The keyframe targets for all available future values
        exist in targets. Apply a lerper and stash*/
        for(let key in targets) {
            let {keyFrameItem:targetKeyFrame, deltaKey} = targets[key]
            let value = targetKeyFrame.valueMap.get(key)
            let existing = keyFrame.valueMap.get(key)
            let stepperPath = `${keyFrame.target.uuid}_${keyFrame.uuid}_${key}`
            let lerper = new Value(existing, value, keyFrame.easing, true)

            /* The entity to store for later.*/
            res[stepperPath] = {
                lerper
                , delta
                , deltaTo: deltaKey
                , key
                , frames: [keyFrame, targetKeyFrame]
            }

        }

        /* Store down.

        Some steppers die. Their values end.*/
        let undeleted = new Set(Object.keys(this.steppers))
        for(let inKey in res) {
            if(this.steppers != undefined) {
                /* replacing an item*/
                this.steppers[inKey] = res[inKey]
            } else {
                // new item

            }
            // const deleted = undeleted.delete(inKey)
        }

        // these keys will end now. no lerp.
        undeleted.forEach(k=>{
            // console.log('Deleting', k)
            // this.steppers[k] = undefined
        })
        // debugger;
        // Object.assign(this.steppers, res)

        if(undeleted.length > 10) {
            // cleanup
            let newSteppers = {}
            for(let key in this.steppers) {
                let val = this.steppers[key]
                if(val == undefined) {
                    continue
                }
                newSteppers[key] = val
            }
            this.steppers = newSteppers
        }
    }

    start() {
        this.running = true
        console.log('start timeline')
        this.tickFunction = this.step.bind(this)
    }

    stop() {
        this.tickFunction = ()=>{}
        this.running = false
        console.log('stop timeline')
    }

    toggleRunning() {
        if(this.running) {
            return this.stop()
        }

        return this.start()
    }

}


class KeyFrame {
    /* A Keyframe maintains the point and the expected value.
        animate through points by applying keyframes to a timeline.

            kf_start = new KeyFrame(point)
            kf_start.set('x', 10)

            kf_end = new KeyFrame(point)
            kf_end.set('x', 200)

            tl = new Timeline(stage)
            tl.add(0, kf_start)
            tl.add(120, kf_end)
    */
    constructor(target, easing) {
        this.target = target
        this.valueMap = new Map;
        this.uuid = Math.random().toString(32)
        this.easing = easing
    }

    set(key, value){
        /* Set the value of a key for this point.

            kf = new KeyFrame(point)
            kf.set('x', 200)

        The KeyFrame is immediate defined - meaning this keyFrame should
        represent the expected value when met. The timeline will lerp to this value.

        Applying the same key twice will overwrite the original value

            kf = new KeyFrame(point)
            kf.set('x', 200)
            kf.set('x', 12)
            kf.get('x')
         */
        this.valueMap.set(key, value)
    }

}

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        // this.events.wake()
        this.dragging.add(this.point)
        this.makeTimeline()
        this.events.wake()
    }

    onMouseUp() {
        this.timeline.ticks = 0
        this.timeline.toggleRunning()
    }

    makeTimeline(){
        let tl = this.timeline = new Timeline(this)

        let kf = new KeyFrame(this.point, sineEaseInOut)
        kf.set('x', 100)
        // kf.x = 200
        tl.add(30, kf)

        let kf2 = new KeyFrame(this.point)
        kf2.set('x', 400)
        kf2.set('y', 100)
        // kf2.x = 200
        tl.add(100, kf2)

        let kf3 = new KeyFrame(this.point)
        kf3.set('x', 40)
        // kf3.set('x', 50)
        // kf3.x = 200
        tl.add(160, kf3)

        let kf4 = new KeyFrame(this.point)
        kf4.set('y', 550)
        // kf4.set('x', 50)
        // kf4.x = 200
        tl.add(220, kf4)
    }

    draw(ctx){
        this.clear(ctx)

        this.timeline.perform(ctx)
        this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

