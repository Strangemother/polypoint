
class GearBox {

    constructor(points) {
        this.tick = 0
        this.doSpokes = true
        /* For xy bound wheels */
        // this.bindMap = new Map()
        // this.bindMapRev = new Map()
        this.bindMap = new XYBindMap()

        this.points = points == undefined? new PointList: points
    }

    performDraw(ctx) {
        this.drawView(ctx)
        this.performStep()
    }

    bindPinionWheels(large, pinion) {

        // pinion.parentWheel = large
        // large.childWheel = pinion
        // pinion.xy = large.xy
        // pinion.isPinion = true

        // this.bindMap.set(large, pinion)
        // this.bindMapRev.set(pinion, large)
        this.bindMap.connect(large, pinion)
    }

    ensureDoubleBound(){
        /*
            Iterate the bindmap, ensuring the XY of a pair match -
         */
        this.bindMap.step()

        return

        // this.bindMap.forEach((vChild, kOwner)=>{

        //     // check dirties.
        //     let target = undefined //vChild
        //     let parent = undefined // kOwner

        //     let kOwner_dirty = kOwner._xy && kOwner._xy.toString() != kOwner.xy
        //     let vChild_dirty = vChild._xy && vChild._xy.toString() != vChild.xy

        //     if(kOwner_dirty === true) {
        //         // copy
        //         // vChild.xy = kOwner.xy
        //         target = vChild
        //         parent = kOwner
        //     }

        //     if(vChild_dirty === true) {
        //         // copy back to parent.
        //         parent = vChild
        //         target = kOwner
        //     }

        //     if(target && target.xy.toString() != parent.xy) {
        //         target.xy = parent.xy
        //     }

        //     // Is now clean.
        //     vChild._xy = vChild.xy
        //     kOwner._xy = kOwner.xy

        // })
    }

    performStep() {
        this.ensureDoubleBound()
        let tick = this.tick += 1
        let ps = this.points

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
                this.doubleTouchCV(origin, touchPoint)
                return
            }

            /*assign tick - for future test.*/
            touchPoint._hitTick = hitTick
            /* Note, this must go _above the bindmap touches it seems,
            else the pinion wheel _slip_ relative to their radius. */

            if(touchPoint.internal || origin.internal){
                /* Internal touches are internalWheel of which rotate
                in the same direction.*/
                activateFunctionInverted(touchPoint, origin, this.internalWheel.bind(this))
            }else {
                activateFunctionInverted(touchPoint, origin, this.gearWheel.bind(this))
            }

            /* Bubble pinion and internal wheels.*/
            safeAppendTouchesActive(this.bindMap.bindMap, touchPoint, this.wheelWheel.bind(this))
            safeAppendTouchesActive(this.bindMap.bindMapRev, touchPoint, this.wheelWheel.bind(this))
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
        let motors = allGears.filter(this.isMotor)
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
        let items = pointList
        if(map.has(key)) {
            const existing =  map.get(key)
            let newTouches = existing.concat(pointList)
            items = newTouches
        }
        map.set(key, items)
    }

    wheelWheel(parentOriginPoint, boundReceiverPoint) {
        /*
        The parentOriginPoint was rotated by the origin, the bound point should receive its rotation
        being an inner wheel of the parentOriginPoint
         */

        // (boundReceiverPoint.ratchet == 0) == both directions
        if( this.ratchetAllowed(parentOriginPoint, boundReceiverPoint) ){
            // both directions.
            boundReceiverPoint.angularVelocity = parentOriginPoint.angularVelocity;
            return
        }
    }


    doubleTouchCV(originPoint, touchPoint) {
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


    isMotor(point) {
        let mv = point.motor
        if(mv === undefined || mv === false) {
            return false
        }

        return true
    }


    drawView(ctx){
        /* Draw a circle at the origin points */
        let style = { color: "#333", line: {color: 'white'}}
        let notMotorColor = '#AAA'
        let motorColor = '#EE55CC'
        let doSpokes = this.doSpokes
        this.points.forEach((p)=> {
            // spokes.
            let angle = p.internal? Math.PI: 0
            doSpokes && p.split(~~(p.radius/5), angle).pen.indicators(ctx, style)
            let color = p.motor == undefined? notMotorColor: motorColor
            let lineColor = 'green'
            if(~~(Math.abs(p.angularVelocity) * 1000) == 0) {
                lineColor = '#333'
            }
            if(p.doubleHit === true) {
                lineColor = 'red'
            }
            p.pen.indicator(ctx, { color, line: {color: lineColor}})
        });

        // let color = p.motor == undefined? '#999': '#444'
        // const c = { circle: { color, width: 1}}
        // this.points.pen.indicators(ctx, c)
        // this.others.pen.indicators(ctx, this.rawPointConf)
    }

    addGear(p, angularVelocity=1){
        if(!p.angularVelocity) {
            p.angularVelocity = angularVelocity
        }
        this.points.push(p)
    }

    addPairGear(primary, pinion) {
        this.addGear(primary)
        this.addGear(pinion)
        // this.points.push(primary, pinion)
        this.bindPinionWheels(primary, pinion)
    }

    gearWheel(originPoint, receiverPoint) {
        /*
         A Gear defines a point edge meeting another point edge.
         Calculate and apply the angularVelocity using the origin and receiver radius.

         Note the originPoint.angularVelocity must exist.
        */
      // originPoint and receiverPoint each have:
      //   radius: number
      //   angularVelocity: number (radians per second or degrees per second)

      // Angular velocity of B given A:
        if( this.ratchetAllowed(originPoint, receiverPoint) ){
            receiverPoint.angularVelocity = -this.calculateReceiverVelocity(originPoint, receiverPoint)
        }
        // circleB.rotation += circleB.angularVelocity
    }

    internalWheel(originPoint, receiverPoint) {
        /*
         A Gear defines a point edge meeting another point edge.
         Calculate and apply the angularVelocity using the origin and receiver radius.

         Note the originPoint.angularVelocity must exist.
        */
      // originPoint and receiverPoint each have:
      //   radius: number
      //   angularVelocity: number (radians per second or degrees per second)

      // Angular velocity of B given A:
        if( this.ratchetAllowed(originPoint, receiverPoint) ){
            receiverPoint.angularVelocity = this.calculateReceiverVelocity(originPoint, receiverPoint)
        }
      // circleB.rotation += circleB.angularVelocity
    }

    calculateReceiverVelocity(originPoint, receiverPoint){
        return (originPoint.radius / receiverPoint.radius) * originPoint.angularVelocity;
    }

    ratchetAllowed(parentOriginPoint, boundReceiverPoint) {
        /* Ratcheting ensures the boundReceiverPoint can (and is) being spun
        in the ratchet direction `-1, 0, 1,` left, both, right respectively.

        If pass, return True:

            + If ratcheting == undefined, assume 0
            + if 0; both directions
            + if -1 ratchet and angularVelocity < 0; ratchet left
            + if 1 ratchet and angularVelocity > 0; ratchet right

        */
        let canRatchet = (
                          (boundReceiverPoint.ratchet == undefined)
                          || (boundReceiverPoint.ratchet < 0 && parentOriginPoint.angularVelocity < 0)
                          || (boundReceiverPoint.ratchet > 0 && parentOriginPoint.angularVelocity > 0)
                        )
        return canRatchet;
    }

    createGear(options) {
        let p = new Point(options)
        this.addGear(p)
        return p
    }

    createReductionGear(options) {
        let p = new Point(options)
        let pin = p.copy().update({ radius: p.radius * .5 })
        this.addPairGear(p, pin)
        return [p, pin]
    }

    createInternalGear(options) {
        let pair = this.createReductionGear(options)
        pair[1].internal = true
        return pair
    }

    createMotor(options) {
        let p = this.createGear(options)
        if(p.motor == undefined) {
            p.motor = 1
        }
        return p
    }
}

