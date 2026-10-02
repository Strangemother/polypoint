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
        this.pinned.push(items)
    }

    step() {
        this.stepPinned()
        this.stepView()
    }

    stepPinned() {
        // Implement the logic to step through pinned gears
        for(let group of this.pinned) {
            // Check for any dirty and use that as the primary gear,
            // else default to the first gear in the group
            // let primary = group.find(item => item.windings.lastDiff != 0) || group[0]
            let primary = group[0]
            for(let i = 1; i < group.length; i++) {
                if(group[i].dirty) {
                    primary = group[i]
                }    
            }
            
            for(let i = 0; i < group.length; i++) {
                if(group[i] !== primary) {
                    /* cache the flag, ensuring continuity of the dirty state */
                    let wasDirty = group[i].dirty
                    group[i].xy = primary.xy
                    group[i].dirty = wasDirty
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
                    if(!group.includes(point)) continue
                    for(let child of group) {
                        if(visited.has(child) || child.radius <= 0) continue
                        visited.add(child)
                        child.rotation += diff
                        queue.push({point: child, diff})
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
        this.items.forEach(point => point.windings.calculate())
    }

    render(ctx, rawPointConf) {
        this.items.pen.indicators(ctx, rawPointConf)
    }
}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
        this.dragging.add(...this.items)
        this.gearBox = new GearBox2(this.items)
        this.gearBox.pin(this.items[0], this.items[1])
        this.gearBox.pin(this.items[4], this.items[5])
    }

    generate(pointCount=2){
        this.items = new PointList(
              new Point({x:300, y:200, radius: 70}),
              new Point({x:500, y:200, radius: 150, rotation: 33}),
              new Point({x:700, y:200, radius: 70, motor: 1}),
              
              new Point({x:800, y:300, radius: 70}),
              new Point({x:500, y:400, radius: 40, internal: true}),
              new Point({x:300, y:400, radius: 60, rotation: 50}),
        )
        this.items.forEach(point => point.windings.reset())
    }

    draw(ctx) {
        this.gearBox.step()
        this.clear(ctx)
        this.drawView(ctx)
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        this.gearBox.render(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()
