/*
title: Simple Gear System
categories: gears
src_dir: ../point_src/
files:
    head
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/stage-clock.js
    ../point_src/touching.js
    ../point_src/protractor.js
    ../point_src/windings.js

---

A simple example of gear-like rotations. Drag to move; Shift-drag to rotate.
Set motor to signed degrees per frame, or false to disable it.
Set internal to true for teeth on the inner rim instead of the outer rim.
The first manually rotated point drives its touching group before any motor.
Register a Line with addRack(line) to connect tangent wheels; passive:false
locks the connected chain when the rack speed is zero.
Set line.rim to -1 or 1 for the negative/positive side from a to b; 0
(the default) engages both sides.
*/


function cv(circleA, circleB, rotation) {
    let direction = circleA.internal || circleB.internal ? 1 : -1
    return direction * (circleA.radius / circleB.radius) * rotation
}

const RACK_TOOTH_SCALE = 0.005 // Keep in sync with animatedSegmentOffset in split.js.
const DEGREES_TO_RADIANS = Math.PI / 180
const RADIANS_TO_DEGREES = 180 / Math.PI


const isMotor = function(point) {
    let mv = point.motor
    if(mv === undefined || mv === false) {
        return false
    }

    return true
}


class GearBox2 {
    /*
    A GearBox2 manages a collection of gears and their interactions.
    */
    constructor(items) {
        this.items = items
        this.pinned = this.pinned || []
        this.spinTargets = []
        this.racks = []
        this.edgeLimit = 5
    }   

    addGear(item) {
        this.items.push(item)
        item.windings.reset()
    }

    addDoubleGear(itemA, itemB) {
        this.addGear(itemA)
        this.addGear(itemB)
        this.pin(itemA, itemB)
    }

    pin(...items) {
        // Implement the logic to pin two gears together
        /* Pin the items together on a single axis
        all points rotate together */
        let pin = {items}
        pin.xyLock = true
        this.pinned.push(pin)
        return pin
    }

    belt(a, b) {
        // Implement the logic to create a belt connection between gears
        let belt = {
            /*
            A belt connection exists between two gears only (at the moment).
            
            In the future, we'll connect many gears using belts as well (e.g like a tank tread)
            */
            items: [a, b],
            /* A default pin ensures two gears share an XY. 
            When xyLock is false, the points move freely, but
            still maintain their compound gear rotation (as if they were pinned together)
            */
            xyLock: false,
            /*
            internal flag, default (Assumed) is gear.
            However the point will still gear connect with other gears,
            even if it is part of a belt connection - e.g. like a chain on a bike 
            (but with a perfect rope)
            */
            type: 'belt',
            /*
            The 'rim' array indicates the attach locations of 
            a belt between two gears. 
            Where the value 0 or 1 indicates the attachment point _top_ or _bottom.
            Importantly for a circle the _top_ is relative to the direction, therefore
            we state _clockwise_ or _counterclockwise_ for the attachment points.
            Where clockwise would be the _first to top_ and counterclockwise would be the _first to bottom_.
            
            If the rim was `1, 0`, it would indicate that the first gear attaches at the top 
            and the second gear attaches at the bottom, thus the second gear spins in the opposite direction.

            top top, or clockwise clockwise
            */
            rim:[1,1] 
        }

        this.pinned.push(belt)
        return belt
    }

    addRack(line, {passive=true}={}) {
        if(!line?.a || !line?.b) {
            throw new TypeError('A rack requires a line with endpoints a and b')
        }
        line.rim ??= 0
        this.rackRim(line)
        if((line.a.z ?? 0) !== (line.b.z ?? 0)) {
            throw new Error('Rack endpoints must be on the same z layer')
        }
        if(!Number.isFinite(line.length) || line.length <= 0) {
            throw new Error('A rack line must have a positive finite length')
        }

        let rack = {
            line,
            layer: line.z ?? line.a.z ?? 0,
            passive,
            speed: Number(line.speed ?? 0),
            phase: 0,
            contacts: []
        }
        if(!Number.isFinite(rack.speed)) {
            throw new TypeError('Rack speed must be a finite number')
        }
        this.racks.push(rack)
        return rack
    }

    rackRim(line) {
        let rim = line.rim ?? 0
        if(![-1, 0, 1].includes(rim)) {
            throw new RangeError('Rack rim must be -1, 0, or 1')
        }
        return rim
    }

    spinTarget(point, target) {
        let dx = target.x - point.x
        let dy = target.y - point.y
        let angle = dx === 0 && dy === 0
            ? undefined
            : Math.atan2(dy, dx) * (180 / Math.PI)
        let driver = {point, target, angle}
        this.spinTargets.push(driver)
        return driver
    }

    step() {
        this.stepPinned()
        this.stepSpinTargets()
        this.stepView()
    }

    stepSpinTargets() {
        for(let driver of this.spinTargets) {
            let dx = driver.target.x - driver.point.x
            let dy = driver.target.y - driver.point.y
            if(dx === 0 && dy === 0) continue

            let angle = Math.atan2(dy, dx) * (180 / Math.PI)
            if(driver.angle !== undefined) {
                let diff = (angle - driver.angle + 540) % 360 - 180
                driver.point.rotation += diff
            }
            driver.angle = angle
        }
    }

    stepPinned() {
        // Implement the logic to step through pinned gears
        for(let group of this.pinned) {
            // Check for any dirty and use that as the primary gear,
            // else default to the first gear in the group
            // let primary = group.find(item => item.windings.lastDiff != 0) || group[0]
            let primary = group.items[0]
            for(let i = 1; i < group.items.length; i++) {
                if(group.items[i].dirty) {
                    primary = group.items[i]
                }    
            }
            
            for(let i = 0; i < group.items.length; i++) {
                if(group.items[i] !== primary) {
                    /* cache the flag, ensuring continuity of the dirty state */
                    if(group.xyLock == true) {
                        let wasDirty = group.items[i].dirty
                        group.items[i].xy = primary.xy
                        group.items[i].dirty = wasDirty
                    }
                }
            }
        }
    }

    isTouching(point, other) {
        if((point.z ?? 0) !== (other.z ?? 0)) return false
        if(!point.internal && !other.internal) {
            return pointToPointContactEdge(point, other, this.edgeLimit)
        }
        if(point.internal && other.internal) return false
        let ring = point.internal ? point : other
        let gear = point.internal ? other : point
        let distance = ring.distanceTo(gear)
        return ring.radius > gear.radius && distance < ring.radius
            && Math.abs(distance + gear.radius - ring.radius) <= this.edgeLimit
    }

    rackContacts(rack) {
        let {a, b} = rack.line
        let rim = this.rackRim(rack.line)
        let dx = b.x - a.x
        let dy = b.y - a.y
        let lengthSquared = dx * dx + dy * dy
        if(lengthSquared === 0) return []

        let length = Math.sqrt(lengthSquared)
        let tangentX = dx / length
        let tangentY = dy / length
        let contacts = []

        for(let point of this.items) {
            if(point.radius <= 0 || (point.z ?? 0) !== rack.layer) continue

            let amount = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared
            amount = Math.max(0, Math.min(1, amount))
            let contactX = a.x + amount * dx
            let contactY = a.y + amount * dy
            let radiusX = contactX - point.x
            let radiusY = contactY - point.y
            let distance = Math.hypot(radiusX, radiusY)
            if(Math.abs(distance - point.radius) > this.edgeLimit) continue
            let side = Math.sign(tangentX * (point.y - a.y) - tangentY * (point.x - a.x))
            if(rim !== 0 && side !== rim) continue

            let cross = radiusX * tangentY - radiusY * tangentX
            if(Math.abs(cross) < 1e-9) continue
            contacts.push({point, cross})
        }
        return contacts
    }

    rackTravel(rack, speed=rack.speed) {
        return speed * rack.line.length * RACK_TOOTH_SCALE
    }

    rackPointDiff(travel, contact) {
        return travel / contact.cross * RADIANS_TO_DEGREES
    }

    beltDiff(belt, point, child, diff) {
        let pointIndex = belt.items.indexOf(point)
        let childIndex = belt.items.indexOf(child)
        let direction = belt.rim[pointIndex] === belt.rim[childIndex] ? 1 : -1
        return direction * (point.radius / child.radius) * diff
    }

    stepView() {
        let sources = []
        let inputDiffs = new Map()
        this.items.forEach(point => {
            point.windings.calculate()
            inputDiffs.set(point, point.windings.lastDiff)
            if(point.windings.lastDiff != 0) sources.push(point)
        })

        this.items.forEach(point => {
            if(isMotor(point) && !sources.includes(point)) sources.push(point)
        })

        let visited = new Set()
        let visitedRacks = new Set()
        let rackQueue = []
        for(let rack of this.racks) {
            rack.contacts = this.rackContacts(rack)
            rack.speed = Number(rack.line.speed ?? 0)
            if(!Number.isFinite(rack.speed)) {
                throw new TypeError('Rack speed must be a finite number')
            }

            let length = rack.line.length
            if(length <= 0 || !Number.isFinite(length)) {
                rack.speed = 0
                rack.contacts = []
                continue
            }

            let travel = this.rackTravel(rack)
            if(travel === 0 && rack.passive) {
                let fastest = undefined
                for(let contact of rack.contacts) {
                    let pointDiff = inputDiffs.get(contact.point) || 0
                    if(pointDiff === 0 && isMotor(contact.point)) {
                        pointDiff = Number(contact.point.motor)
                    }
                    if(pointDiff === 0) continue

                    let candidate = pointDiff * DEGREES_TO_RADIANS * contact.cross
                    if(fastest === undefined || Math.abs(candidate) > Math.abs(fastest)) {
                        fastest = candidate
                    }
                }
                if(fastest !== undefined) {
                    travel = fastest
                    rack.speed = travel / (length * RACK_TOOTH_SCALE)
                }
            }

            if(travel !== 0 || !rack.passive) {
                rackQueue.push({rack, diff: travel})
                visitedRacks.add(rack)
            }
        }

        this.stepMotionQueue(rackQueue, visited, visitedRacks, inputDiffs)

        for(let source of sources) {
            if(visited.has(source) || source.radius <= 0) continue
            let diff = source.windings.lastDiff
            if(diff == 0) {
                source.rotation += Number(source.motor)
                source.windings.calculate()
                diff = source.windings.lastDiff
            }
            if(diff == 0) continue

            visited.add(source)
            this.stepMotionQueue([{point: source, diff}], visited, visitedRacks, inputDiffs)
        }

        this.visited = visited
        this.items.forEach(point => point.windings.calculate())
        this.racks.forEach(rack => rack.phase += rack.speed)
    }

    stepMotionQueue(queue, visited, visitedRacks, inputDiffs) {
        for(let index = 0; index < queue.length; index++) {
            let node = queue[index]
            if(node.rack) {
                for(let contact of node.rack.contacts) {
                    let child = contact.point
                    if(visited.has(child)) continue
                    let childDiff = this.rackPointDiff(node.diff, contact)
                    visited.add(child)
                    child.rotation += childDiff - (inputDiffs.get(child) || 0)
                    queue.push({point: child, diff: childDiff})
                }
                continue
            }

            let {point, diff} = node
            for(let group of this.pinned) {
                if(!group.items.includes(point)) continue
                for(let child of group.items) {
                    if(visited.has(child) || child.radius <= 0) continue
                    let childDiff = group.type === 'belt'
                        ? this.beltDiff(group, point, child, diff)
                        : diff
                    visited.add(child)
                    child.rotation += childDiff - (inputDiffs.get(child) || 0)
                    queue.push({point: child, diff: childDiff})
                }
            }
            for(let child of this.items) {
                if(visited.has(child) || child.radius <= 0) continue
                if(!this.isTouching(point, child)) continue
                let childDiff = cv(point, child, diff)
                visited.add(child)
                child.rotation += childDiff - (inputDiffs.get(child) || 0)
                queue.push({point: child, diff: childDiff})
            }
            for(let rack of this.racks) {
                if(visitedRacks.has(rack)) continue
                let contact = rack.contacts.find(item => item.point === point)
                if(!contact) continue
                let travel = diff * DEGREES_TO_RADIANS * contact.cross
                if(travel === 0 && rack.passive) continue

                let length = rack.line.length
                if(length <= 0) continue
                rack.speed = travel / (length * RACK_TOOTH_SCALE)
                visitedRacks.add(rack)
                queue.push({rack, diff: travel})
            }
        }
    }

    render(ctx, rawPointConf) {
        let conf = Object.assign(rawPointConf)
        for(let point of this.visited) {
            let count = ~~(point.radius * .2)
            let dir = point.internal ? Math.PI : 0
            point.split(count, dir).pen.indicators(ctx, conf)
        }
        this.items.pen.indicators(ctx, conf)
    }
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: '#444', width: 1}}
        this.generate()
        this.dragging.add(...this.items)
        this.gearBox = new GearBox2(this.items)
        this.gearBox.pin(this.items[0], this.items[1])
        this.gearBox.pin(this.items[4], this.items[5])
        
        let pin = this.gearBox.pin(this.items[6], this.items[7])
        pin.xyLock = false
        
        let pin2 = this.gearBox.belt(this.items[8], this.items[9])
        this.spinTarget = new Point({x:500, y:500, radius: 50})
        this.dragging.add(this.spinTarget)
        this.gearBox.spinTarget(this.items[8], this.spinTarget)

        this.line = new Line(
            new Point({x:200, y:200, z: 0}),
            new Point({x:400, y:400, z: 0})
        )
        this.line.speed = 0.5
        this.line.rim = 1
        this.dragging.add(this.line.a, this.line.b)

        this.rack = this.gearBox.addRack(this.line)
    }

    generate(pointCount=2){
        this.items = new PointList(
              new Point({x:300, y:200, radius: 70}),
              new Point({x:480, y:200, radius: 150, rotation: 33}),
              new Point({x:700, y:200, radius: 70, motor: 1}),
              
              new Point({x:800, y:300, radius: 70}),

              new Point({x:300, y:370, radius: 40, internal: true}),
              new Point({x:300, y:360, radius: 60, rotation: 50}),

              new Point({x:300, y:470, radius: 40}),
              new Point({x:500, y:460, radius: 60, rotation: 50}),

              new Point({x:300, y:570, radius: 40}),
              new Point({x:500, y:560, radius: 60, rotation: 50}),
        )
        this.items.forEach(point => point.windings.reset())
    }

    draw(ctx) {
        this.gearBox.step()
        this.clear(ctx)
        this.drawView(ctx)
        this.spinTarget.pen.indicator(ctx)
        this.line.render(ctx)

        let count = ~~(this.line.length * .04)
        
        let splits = this.line.splitAnimated(count, -90, 1, this.rack.phase)
        splits.pen.indicators(ctx, this.rawPointConf)

    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        this.gearBox.render(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()
