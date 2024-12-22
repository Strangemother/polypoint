/*
---
title: Timeline (Second Attempt)
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
    I wasn't satified with the other attempt. In this version we do better.

 */

/*
+ A timeline runs a X.fps, until a length.
+ It may cycle at the end
+ keyframe aligned along the timeline for each item:value
+ lerping between values (linear by default.)
+ timeline stepping is per frame tick.
+ because the timeline end is transient, if the timeline loops, the
    _old_ values from the initial set can _lerp_ into the incoming future values;
    the new future can be at 0 index.

 */

const TIMELINE_START = -1
class TimelineBase {

    constructor(stage, target) {
        this.stage = stage
        /* The _point_ if available. */
        this.target = target
        /* The _current_ tick value. A _null_ value is -1
        as 0 is the root keyframe.*/
        this.ticks = TIMELINE_START
        /* Value to _add_ per tick. If -1, the timeline will
        render in reverse. */
        this.tickValue = 1
        /* Every Tip hit, the bounce is +1.*/
        this.bounces = 5

        /* The internal bounce counter. */
        this._bouncesCount = 0

        this.speed = 1

        // bounce, loop, stop
        this.cycle = 'bounce'
        // this.cycle = 'loop'

        this.tickFunction = ()=>{}
        this.keyframeMap = new NestedMap

        this.setup()
    }

    setup() {}

    perform(ctx) {
        /* Run _perform_ at every draw, performing a step if enabled */
        this.tickFunction.apply(this, arguments)
    }

    step() {
        this.ticks += (this.tickValue * this.speed);
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

    reset(){
        this.ticks = TIMELINE_START
        this.tickValue = 1
        this._bouncesCount = 0
    }

    toggleRunning() {
        if(this.running) {
            return this.stop()
        }

        return this.start()
    }

}


class NestedMap extends Map {

    append(key, value) {
        if(this.has(key) ){
            let v = this.get(key)
            v.push(value)
            let l = v.length
            this.set(key, v)
            return l
        }
        this.set(key, [value])
        return 1
    }
}



const bounce = function(timeline) {
    // console.log('bounce', timeline)
    if(timeline._bouncesCount >= timeline.bounces) {
        return
    }
    timeline.tickValue *= -1
    timeline._bouncesCount += 1
}


const loop = function(timeline) {
        // first or last.
        let newTick = TIMELINE_START
        let isRev = timeline.tickValue < 0;
        if(isRev) {
            // Go to the end
            newTick = timeline.getLastIndex() + 1
        }

        timeline.ticks = newTick
        timeline.lerpers = {}
}


class Timeline extends TimelineBase {

    add(index, keyframe) {
        if(!(keyframe instanceof KeyFrame)) {
            keyframe = new KeyFrame(keyframe)
        }

        this.keyframeMap.append(index, keyframe)
        keyframe.onTimelineApply(this, index)
    }

    insert(many) {
        for(let index in many) {
            let kf = many[index]
            this.add(Number(index), kf)
        }
    }

    setup() {
        this._doInd = true
        this.indicatorPoint = new Point(20, 20)
        this.indicatortickRate = 30
        this.lerpers = {}
        this.defaultEasingFunction = easingFunctions.linear.inOut

        this.start()
    }

    step(ctx) {
        this.ticks += this.tickValue * this.speed
        if(this.ticks < 0) {
            this.ticks = -1
        }
        // lerp existing.
        // capture ticked.
        this.actionHits(Math.trunc(this.ticks))
        this.updateLerpers(this.ticks)
        this.ticker(ctx)
    }

    getLastIndex(){
        /* return this last keyframe index. */
        return Math.max(...this.keyframeMap.keys())
    }

    actionHits(index=this.ticks) {
        // at index fins any keyframes.
        if(!this.keyframeMap.has(index)) {
            return
        }
        /* work to spool. */
        let kfs = this.keyframeMap.get(index)
        if(kfs == undefined) {
            // no here.
            return
        }

        let tl = this;
        // console.log('!Action - at frame', index, kfs)
        // For each Key,
        // //set value trhough the given smoothing function
        /* For all the discovered keyframes*/
        let res = {}

        const forEachPropInKeyFrames = function(kfs, caller) {
            kfs.forEach(function(kf){
                kf.forEach((propertyKey, value)=>{
                    caller(propertyKey, value, kf)
                });
            });
        }

        /* A list of all integer indexes,
        from this index forward.*/
        let isRev = this.tickValue < 0;
        let dir = (isRev) ? (v)=>v<index : (v)=>v>index

        let futureIndexKeys = Array.from(this.keyframeMap.keys()).filter(dir)
        if(isRev) {
            futureIndexKeys.reverse()
        }

        // console.log('Looking ahead at timepoints', futureIndexKeys)

        const getMatchingFutureKeyFrame = function(propertyKey, indexKeys) {
            /*return keyframes with the same property */
            for(let futureIndex of indexKeys) {
                let futureKfs = tl.keyframeMap.get(futureIndex)
                for(let fkf of futureKfs) {
                    if(fkf.has(propertyKey)) {
                        // a future key with the same property.
                        // console.log('First Future', futureIndex, propertyKey)
                        return [futureIndex, fkf]
                    }
                }
            }
        }

        /* -------------------------------------------------------------------*/

        forEachPropInKeyFrames(kfs, (propertyKey, value, kf)=>{
            let futureResult = getMatchingFutureKeyFrame(propertyKey, futureIndexKeys)
            if(!futureResult) {
                // The key has no lerp future.
                // console.log('No future for', propertyKey)
                /* Just put the current value on the target.*/
                this.target[propertyKey] = value
                return
            }

            let [futureIndex, fkf] = futureResult
            let toValue = fkf.get(propertyKey)
            /* Grab the easing function from the _value_

                keyFrame = {
                    rotation: withEasing(100, easingFunc)
                }

                If in reverse, we capture the easing future in the opposite direction.
            */

            let valueEasingFunction;
            if(isRev) {
                if(toValue.reverseEasingFunction){
                    valueEasingFunction = toValue.reverseEasingFunction
                    // if(valueEasingFunction == REV_REV) {
                    //     // valueEasingFunction = value.easingFunction

                    //     valueEasingFunction = getMatchingFutureKeyFrame(propertyKey,
                    //         futureIndexKeys.slice(1)
                    //         )[1].get(propertyKey).easingFunction

                    // }
                } else {
                    valueEasingFunction = toValue.easingFunction
                }
            } else {
                valueEasingFunction = value.easingFunction
            }

            let easer = valueEasingFunction || kf.easingFunction
            if(easer == undefined) {
                easer = this.defaultEasingFunction
            }

            /* Install the Value, of which is ticked per step().*/
            let lerper = new Value(value, toValue, easer, true)
            if(this.lerpers[propertyKey] !== undefined) {
                let entry = this.lerpers[propertyKey]
                let switchly = index == entry.toIndex
                if(!switchly) {
                    /* This lerper intends to replace another lerper,
                    of which is not ending exactly now.
                    */
                    // console.warn('Installing existing key', propertyKey, 'ends at:', index, entry.toIndex)
                }
            }

            this.lerpers[propertyKey] = {
                lerper,
                fromIndex: index,
                toIndex: futureIndex,
            }

            let s = [
                `Found: "${propertyKey}" `
                , `from(#${index}, ${value}) => `
                , `to(#${futureIndex}, ${toValue})`
            ]
            // console.log(s.join(''))
            /*
            The property found exists in one of the _current_ keyframes
            And also exists in the _give_ future key frame.

            The property value should _lerp_ through the distance
            of these keyframes.
            width = futureIndex - index
            from = the current value
            to = the future keyframe value (e.g. X) `toValue`
            */

            /* Just put the current value on the target.*/
            // this.target[propertyKey] = value
        })

        if(futureIndexKeys.length==0) {
            console.log('!Last Keframe:', index)
            /* There are no more future indexes.
            the timeline should cycle, stop, or bounce */
            let cycleMap = {
                'bounce': bounce
                , 'loop': loop
            }

            cycleMap[this.cycle](tl)

            // if(this.cycle == 'bounce') {
            //     return this.bounce()
            // }

            // if(this.cycle == 'loop') {
            //     // first or last.
            //     let newTick = -1
            //     if(isRev) {
            //         // Go to the end
            //         newTick = 300
            //     }
            //     this.ticks = newTick
            // }

        }

    }

    updateLerpers(index){
        for(let k in this.lerpers) {
            let entry = this.lerpers[k]

            let lerper = entry.lerper;
            let relTicks = index - entry.fromIndex
            let width = entry.toIndex - entry.fromIndex
            // let width = lerper.width()
            let oneBit = 1 / width
            let along = oneBit * relTicks
            let newValue = lerper.get(along)

            this.target[k] = newValue
        }
    }

    ticker(ctx){
        let doInd = this._doInd
        if(this.ticks % this.indicatortickRate == 0)  {
            // ind. color flip
            this._doInd = !this._doInd
        }

        if(doInd) {
            this.indicatorPoint.pen.fill(ctx, '#880000')
        }
    }

}


class KeyFrame {
    constructor(values={}, easing='linear'){
        this.values = values
        this.easingFunction = easingFunctions.get(easing)

    }

    onTimelineApply(timeline, index) {
        /* This keyframe was applied to this timeline. */
    }

    set(k, v) {
        this.values[k] = v
    }

    get(k) {
        return this.values[k]
    }

    has(k) {
        return k in this.values;
    }

    forEach(caller) {
        // return this.values.forEach(caller)
        let vs = this.values
        for(let k in vs) {
            caller(k, vs[k])
        }
    }
}


class KeyValue extends Number {
}

const REV_REV = 'rev_rev'

class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(50, 50, 20)
        // this.events.wake()
        this.dragging.add(this.point)
        this.makeTimeline()
        this.events.wake()
        this.clickEvent = false
    }

    onMouseUp() {
        let tl = this.timeline
        this.clickEvent = !this.clickEvent

        if(this.clickEvent == false) {
            console.log('Reseting time')
            this._runClicker = false
            this.timeline.speed = 1
        } else {
            console.log('Pausing')
            this._runClicker = true
        }
    }

    makeTimeline(){
        let tl = this.timeline = new Timeline(this, this.point)
        // If a keyframe is 0, the property is set, not lerp.

        let kv = 50
        const withEasing = function(value, easer, reverseEaser) {
            let v = new KeyValue(value)
            if(easer!=undefined) {
               v.easingFunction = easer
            }
            if(reverseEaser!=undefined) {
                v.reverseEasingFunction = reverseEaser
            }
            return v
        }
        // kv.easingFunction = easingFunctions.elastic.inOut

        tl.add(0, new KeyFrame({
            x: 20
            , y: withEasing(20, easingFunctions.bounce.out, easingFunctions.sine.inOut)
            // , y: withEasing(20, easingFunctions.bounce.out, easingFunctions.quad.inOut)
            , radius: 50
        }))

        let kf = new KeyFrame({
                x: 100
                , rotation: UP_DEG
                , radius: 100
            })
        // kf.easingFunction = easingFunctions.elastic.inOut

        tl.add(60, kf)

        tl.add(120, {
            // y: 400
            y: withEasing(400, undefined, easingFunctions.bounce.out)
            , radius: 70
        })

        tl.add(180, {
            y: 200
            // y: withEasing(200, undefined, easingFunctions.elastic.out)
            , rotation: 190
        })


        tl.insert({
            240: {
                x: 200
                , radius: 20
            }

            /*, 300: new KeyFrame({
                x: 300
                , y: 300
                , rotation: 0
                , radius: 50
            })

            , 360: new KeyFrame({
                x: 400
                , rotation: 0
            })

            , 400: {
                rotation: UP_DEG
            }*/
        })
    }

    draw(ctx){
        this.clear(ctx)
        if(this._runClicker == true){
            this.timeline.speed *= .92

            if(this.timeline.speed < .01) {
                this._runClicker = false
                console.log('Stopping clicker')
                // this.timeline.speed = 1
                // this.timeline.reset()
                // this.timeline.toggleRunning()
            }
        }

        this.timeline.perform(ctx)
        // this.point.pen.fill(ctx, '#880000')
        this.point.pen.indicator(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

