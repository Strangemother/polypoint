/*
title: Gears (Nearly)
categories: gears
src_dir: ../point_src/
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    dragging
    pointlist
    mouse
    stroke
    ../point_src/split.js
    ../point_src/stage-clock.js
    ../point_src/touching.js
    ../point_src/coupling.js


---

A simple example of gear-like rotations
*/


function gearWheel(originPoint, receiverPoint) {
    /*
     A Gear defines a point edge meeting another point edge.
     Calculate and apply the angularVelocity using the origin and receiver radius.

     Note the originPoint.angularVelocity must exist.
    */
  // originPoint and receiverPoint each have:
  //   radius: number
  //   angularVelocity: number (radians per second or degrees per second)

  // Angular velocity of B given A:
  receiverPoint.angularVelocity = -(originPoint.radius / receiverPoint.radius) * originPoint.angularVelocity;
  // circleB.rotation += circleB.angularVelocity
}

function wheelWheel(parentPoint, boundPoint) {
    /*
    The parentPoint was rotated by the origin, the bound point should receive its rotation
    being an inner wheel of the parentPoint
     */
    //
    boundPoint.angularVelocity = parentPoint.angularVelocity;
}


const doubleTouchCV = function(originPoint, touchPoint) {
    // Angular velocity it given by a previous, and now this.
    // B should be the max of itself or the given.

    // console.warn('double touch', hitTick)
    // Average.
    if(originPoint.angularVelocity == touchPoint.angularVelocity) {
        // Same - no change required.
        touchPoint.doubleHit = false
        return
    }

    touchPoint.doubleHit = true
    // let newA = circleA.angularVelocity
    // if(circleA.angularVelocity < 0){
    //     newA = Math.min(circleB.angularVelocity, circleA.angularVelocity)
    // }

    // if(circleA.angularVelocity > 0){
    //     newA = Math.max(circleB.angularVelocity, circleA.angularVelocity)
    // }

    // circleB.angularVelocity = newA
    // circleB.rotation += circleB.angularVelocity
}


const isMotor = function(point) {
    let mv = point.motor
    if(mv === undefined || mv === false) {
        return false
    }

    return true
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        /* For xy bound wheels */
        this.bindMap = new Map()
        this.bindMapRev = new Map()

        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        let r = this.generate()
        this.dragging.add(...r)
        this.tick = 0
        this.dragging.onEmptyDown = this.onEmptyDown.bind(this)
    }

    onEmptyDown(ev) {
        console.log('onEmptyDown')
        const p = Point.from(ev)
        p.radius = 60
        p.angularVelocity = 1
        this.randomPoints.push(p)
        this.dragging.add(p)
    }

    generate(pointCount=2){


        let ps = this.randomPoints = new PointList(
            new Point({x:100, y:200, radius: 70, motor: 1, angularVelocity: 0}),
            new Point({x:350, y:200, radius: 150, angularVelocity: 0}),

            new Point({x:700, y:200, radius: 70, angularVelocity: 0}),
            new Point({x:800, y:300, radius: 70, motor: -.5, angularVelocity: 0}),
            new Point({x:600, y:100, radius: 70, angularVelocity: 0}),
            new Point({x:600, y:400, radius: 100, angularVelocity: 0}),
            new Point({x:659, y:500, radius: 20, angularVelocity: 0}),
            new Point({x:150, y:450, radius: 50, angularVelocity: 0}),
            new Point({x:180, y:150, radius: 10, angularVelocity: 0})
        )

        this.bindPinionWheels(ps[1], ps[8])

        return this.randomPoints
    }

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)
        this.performStep()
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    bindPinionWheels(large, pinion) {

        // pinion.parentWheel = large
        large.childWheel = pinion
        pinion.xy = large.xy
        pinion.isPinion = true

        this.bindMap.set(large, pinion)
        this.bindMapRev.set(pinion, large)

    }

    ensureDoubleBound(){
        /*
            Iterate the bindmap, ensuring the XY of a pair match -
         */
        this.bindMap.forEach((vChild, kOwner)=>{

            // check dirties.
            let target = undefined //vChild
            let parent = undefined // kOwner

            let kOwner_dirty = kOwner._xy && kOwner._xy.toString() != kOwner.xy
            let vChild_dirty = vChild._xy && vChild._xy.toString() != vChild.xy

            if(kOwner_dirty === true) {
                // copy
                // vChild.xy = kOwner.xy
                target = vChild
                parent = kOwner
            }

            if(vChild_dirty === true) {
                // copy back to parent.
                parent = vChild
                target = kOwner
            }

            if(target && target.xy.toString() != parent.xy) {
                target.xy = parent.xy
            }

            // Is now clean.
            vChild._xy = vChild.xy
            kOwner._xy = kOwner.xy

        })
    }

    performStep() {
        this.ensureDoubleBound()
        let tick = this.tick += 1
        let ps = this.randomPoints

        if(this.waiting) {
            // previous break-early
            let extended = this.recursiveSpinTouchMap(tick, this.waiting, ps, 3)
            if(extended) {
                console.warn('too far')
            }
        }

        let tm = this.spinGears(ps)
        this.waiting = this.recursiveSpinTouchMap(tick, tm, ps, 6)
        this.pushVelocities(ps)
    }

    pushVelocities(ps) {
        /* Iterate all the points, applying the angular velocity
        given in the compute steps.
        */
        ps.forEach((p)=> {
            // here we can _spend_ the amount of velocity.
            p.rotation += p.angularVelocity

            if(p.motor) { return }

            /* This is an issue for pinions, as the size difference
            computes differently.
            Without this, _untouched_ points continue to rotate.

            The solution is to bubble the change to the child or parent.
            However, this means a points velocity is computed twice.
            */
            p.angularVelocity *= .93
        })

    }

    recursiveSpinTouchMap(tick, touchMap, ps, maxCount=5, currentCount=0) {
        if(touchMap.size <= 0) {
            // nothing to do.
            return
        }

        if(currentCount > maxCount) {
            /* break early.*/
            // console.warn('breakEaryl', maxCount)
            return touchMap
        }

        let replacement = this.spinChildren(touchMap, ps, tick)
        return this.recursiveSpinTouchMap(tick, replacement, ps, maxCount, currentCount+1)
    }

    spinChildren(touchMap, allGears, hitTick) {
        /*
        An entry in the touch map:

            origin: [touchPoint, ...]

            the touch points is not rotated yet, and should receive the
            rotation of the origin.

            Returned is a new touchmap, where each touchPoint is the origin
            and the touches are next gears - devoid of the origin.
        */
        let nextTouchMap = new Map;

        const getTouching =  function(wheel, origin) {
            return this.getSingleTouching(
                wheel,
                allGears,
                origin, /* origin is the motor
                        - don't feed backward.*/
            )
        }.bind(this)

        const safeAppendTouch = function(parentWheel, touching){
            if(touching.length == 0) {
                return
            }

            // store down into a new touch map.
            // nextTouchMap.set(motor, touching)
            // origin: touches
            this.appendMap(nextTouchMap, parentWheel, touching)
        }.bind(this)

        const safeAppendTouchesActive = function(map, touchPoint, func){

            let boundWheel = map.get(touchPoint)
            if(boundWheel == undefined){ return }
                /* This is a reduction gear (a gear with a smaller gear
                (pinion) within. The touchPoint is bound to the `b` point.
                */

                /* Wheel wheel performs a locked (pinned) angularVelocity */
                // wheelWheel(touchPoint, boundWheel)
                // func(touchPoint, boundWheel)

                // /* Push bound point touches, */
                // let touching = getTouching(boundWheel, touchPoint)
                // safeAppendTouch(boundWheel, touching)
            activateFunction(touchPoint, boundWheel, func)
        }//.bind(this)

        const activateFunction = function(target, origin, func) {
            func(target, origin)
            /* Push bound point touches, */
            let touching = getTouching(origin, target)
            safeAppendTouch(origin, touching)
        }

        const activateFunctionInverted = function(target, origin, func) {
            // push rotation
            func(origin, target)
            let touching = getTouching(target, origin)
            safeAppendTouch(target, touching)
        }

        const forEachEach = function(touchMap, func) {
            // Origin should be motor.
            touchMap.forEach((touchPoints, origin)=> {
                // Iterate the touchPoints array, rotating and getting hits.
                touchPoints.forEach((touchPoint) => {
                    func(origin, touchPoint, touchPoints)
                })
            })
        }

        // touchMap.forEach((touchPoints, origin)=> {
        //     // Origin should be motor.

        //     // Iterate the touchPoints array, rotating and getting hits.
        //     touchPoints.forEach((touchPoint) => {
        //         const doubleHit = touchPoint._hitTick == hitTick
        //         touchPoint.doubleHit = doubleHit

        //         if(doubleHit) {
        //             // fancy math?
        //             doubleTouchCV(origin, touchPoint)
        //             return
        //         }

        //         /*assign tick - for future test.*/
        //         touchPoint._hitTick = hitTick

        //         safeAppendTouchesActive(this.bindMap, touchPoint, wheelWheel)
        //         safeAppendTouchesActive(this.bindMapRev, touchPoint, wheelWheel)
        //         activateFunctionInverted(touchPoint, origin, gearWheel)
        //     })
        // })

        let callback = (origin, touchPoint, touchPoints)=> {
            const doubleHit = touchPoint._hitTick == hitTick
            touchPoint.doubleHit = doubleHit

            if(doubleHit) {
                // fancy math?
                doubleTouchCV(origin, touchPoint)
                return
            }

            /*assign tick - for future test.*/
            touchPoint._hitTick = hitTick
            /* Note, this must go _above the bindmap touches it seems,
            else the pinion wheel _slip_ relative to their radius. */
            activateFunctionInverted(touchPoint, origin, gearWheel)
            safeAppendTouchesActive(this.bindMap, touchPoint, wheelWheel)
            safeAppendTouchesActive(this.bindMapRev, touchPoint, wheelWheel)
        }

        forEachEach(touchMap, callback)

        return nextTouchMap
    }

    spinGears(allGears) {
        /*Filter touching.
        store as descendant.
        Loop each descendant
        store descendant.
        If already visited - raise error
        */
        /* Naturally rotate motors.*/
        let motors = allGears.filter(isMotor)
        // motors.each.rotation = (p)=> p.rotation + p.motor
        motors.each.angularVelocity = (p) => p.motor;
        return this.getTouching(motors,allGears)
    }

    getTouching(motors, allGears) {
        let touchMap = new Map;
        // For each item, we store its _next_ items.
        for(let motor of motors) {
            let touching = this.getSingleTouching(motor, allGears, motor)

            if(touching.length == 0) {
                continue
            }

            this.appendMap(touchMap, motor, touching)

        }

        return touchMap
    }

    getSingleTouching(target, allGears, exceptPoint=undefined) {
        /* return a list of all touching points for this target,
        except the exceptPoint*/
        let touching = pointToManyContact(target, allGears, true, 5)
        return touching.filter(p=> p != exceptPoint);
    }

    appendMap(map, key, pointList) {
        if(map.has(key)) {
            const existing =  map.get(key)
            let newTouches = existing.concat(pointList)
            map.set(key, newTouches)
        } else {

            map.set(key, pointList)
        }
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        let style = { color: "#333", line: {color: 'white'}}
        let notMotorColor = '#AAA'
        let motorColor = '#EE55CC'

        this.randomPoints.forEach((p)=> {
            // spokes.
            p.split(~~(p.radius/5)).pen.indicators(ctx, style)
            let color = p.motor == undefined? notMotorColor: motorColor
            let lineColor = 'green'
            if(p.doubleHit === true) {
                lineColor = 'red'
            }
            p.pen.indicator(ctx, { color, line: {color: lineColor}})
        })

        // let color = p.motor == undefined? '#999': '#444'
        // const c = { circle: { color, width: 1}}
        // this.randomPoints.pen.indicators(ctx, c)
        // this.others.pen.indicators(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()