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
    ../point_src/stage-clock.js
    ../point_src/touching.js
    ../point_src/protractor.js
    ../point_src/windings.js

---

A simple example of gear-like rotations. Drag to move; Shift-drag to rotate.
Set motor to signed degrees per frame, or false to disable it.
Set internal to true for teeth on the inner rim instead of the outer rim.
The first manually rotated point drives its touching group before any motor.
*/


function cv(circleA, circleB, rotation) {
    let direction = circleA.internal || circleB.internal ? 1 : -1
    let diff = direction * (circleA.radius / circleB.radius) * rotation
        circleB.rotation += diff
        return diff
}


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

    beltDiff(belt, point, child, diff) {
        let pointIndex = belt.items.indexOf(point)
        let childIndex = belt.items.indexOf(child)
        let direction = belt.rim[pointIndex] === belt.rim[childIndex] ? 1 : -1
        return direction * (point.radius / child.radius) * diff
    }

    stepView() {
        let sources = []
        this.items.forEach(point => {
            point.windings.calculate()
            if(point.windings.lastDiff != 0) sources.push(point)
        })

        this.items.forEach(point => {
            if(isMotor(point) && !sources.includes(point)) sources.push(point)
        })

        let visited = new Set()
        for(let source of sources) {
            if(visited.has(source) || source.radius <= 0) continue
            let diff = source.windings.lastDiff
            if(diff == 0) {
                source.rotation += Number(source.motor)
                source.windings.calculate()
                diff = source.windings.lastDiff
            }
            if(diff == 0) continue

            let queue = [{point: source, diff}]
            visited.add(source)
          
            for(let index = 0; index < queue.length; index++) {
                let {point, diff} = queue[index]
                for(let group of this.pinned) {
                    if(!group.items.includes(point)) continue
                    for(let child of group.items) {
                        if(visited.has(child) || child.radius <= 0) continue
                        let childDiff = group.type === 'belt'
                            ? this.beltDiff(group, point, child, diff)
                            : diff
                        visited.add(child)
                        child.rotation += childDiff
                        queue.push({point: child, diff: childDiff})
                    }
                }
                for(let child of this.items) {
                    if(visited.has(child) || child.radius <= 0) continue
                    if(!this.isTouching(point, child)) continue
                    visited.add(child)
                    queue.push({point: child, diff: cv(point, child, diff)})
                }
            }
        }

        this.visited = visited
        this.items.forEach(point => point.windings.calculate())
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
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        this.gearBox.render(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()
