/*
title: Example
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    mouse
    dragging
    stroke
    ../point_src/velocity.js
---

*/


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        let rowCount = 20
        this.ps = PointList.generate.grid(200, rowCount, 30)
        this.gt = this.ps.generate.getGridTool(rowCount)
        this.ps.each.radius = 10
        this.dragging.add(...this.ps)
        this.ps.forEach(p=> p.velocity.set(1,1))
        console.log('mounted')
        this.actives = []
        this.subVal = .99
    }

    onMousedown(ev) {
        let p = this.dragging.getPoint()
        p && this.pushVelocities(p)
    }

    pushVelocities(origin) {
        let power = 20
        let ps = this.ps;
        let i = ps.indexOf(origin)

        pushVelocities(ps, this.gt, origin)
    }

    step() {
        let gt = this.gt
        let ps = this.ps
        let actives = this.actives
        // let newActives = []
        ps.forEach(function(p, i){
            let siblings = gt.getSiblings(i)
            // p.velocity.mutableMul({x:.99, y:.99})
            // let p = ps[i]
            let v = p.velocity

            /* Add all the velocities together. */
            let c = 1
            siblings.forEach(function(j){
                let ot = ps[j].velocity
                if(ot.x + ot.y < 0.3) {
                    return /* skip blanks */
                }

                c += 1
                v = v.add(ot)
            })
            /* Then divide to add to _self_. */
            v = v.div({x:c, y:c})
            v.x = clamp(v.x, 1, 10)
            v.y = clamp(v.y, 1, 10)

            p.velocity.copy(v)
            // newActives = newActives.concat(siblings)
        })
    }

    draw(ctx){
        this.clear(ctx)
        // this.step()
        this.ps.pen.circle(ctx, undefined, 'purple')
        let subVal = this.subVal
        this.ps.forEach(function(p){
            p.pen.line(ctx, p.add(p.velocity), 'red')
            // p.velocity.mutableSub({x:subVal, y:subVal})
            p.velocity.mutableMul({x:subVal, y:subVal})
        })
    }
}


const pushVelocities = function(ps, gt, origin) {
    let power = 20;          // initial velocity magnitude
    let damping = 0.8;      // how much velocity is reduced each neighbor
    let minThreshold = 0.1; // cutoff to stop pushing once the velocity is tiny

    // let ps = this.ps;d
    let originIndex = ps.indexOf(origin);

    // Keep track of points we’ve processed
    let visited = new Set();

    // Our BFS queue: each entry has { idx, strength }
    let queue = [{ idx: originIndex, strength: power }];

    // Process until we exhaust the queue
    while (queue.length > 0) {
        let { idx, strength } = queue.shift();

        // Skip if we've seen this point or if strength is too small
        if (visited.has(idx) || strength < minThreshold) continue;
        visited.add(idx);

        let current = ps[idx];

        // For each neighbor, add velocity
        let neighbors = gt.getSiblings(idx);
        neighbors.forEach(neighIdx => {
            if (!visited.has(neighIdx)) {
                let neighbor = ps[neighIdx];
                if(!neighbor) {
                    return
                }
                // Direction from current point to neighbor
                let angleRads = current.directionTo(neighbor);
                // Add velocity in that direction
                let add = {
                    x: Math.cos(angleRads) * strength,
                    y: Math.sin(angleRads) * strength
                };

                neighbor.velocity.mutableAdd(add);

                // Enqueue neighbor to continue the“wave
                queue.push({
                    idx: neighIdx,
                    strength: strength * damping
                });
            }
        });
    }
}


stage = MainStage.go(/*{ loop: true }*/)
