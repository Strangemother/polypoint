/*
title: Vector Rotation Field
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
    ../point_src/random.js
---

*/


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        let rowCount = 44
        this.ps = PointList.generate.grid(2000, rowCount, 10)
        this.gt = this.ps.generate.getGridTool(rowCount)
        this.ps.each.radius = 10
        // this.ps.each.rotation = ()=> random.int(10)
        console.log('mounted')
        this._i = 0
        this.ps[1366].rotation = 122
    }

    onMousedown(ev) {
        let p = this.dragging.getPoint()
        // p && this.pushVelocities(p)
        this.ps.each.rotation = (p)=>p.rotation += random.int(-360)
    }

    step() {
        /*
            The rotation of a neighbour is applies to a current..
        */
        let gt = this.gt
        let ps = this.ps
        let pi = Math.PI

        ps.forEach(function(p, i){
            if(i==1366) {
                return
            }
            let siblings = gt.getSiblings(i, 1000, 10)
            let r = siblings.map(j=>ps[j]?.radians || 0)
            let resultantTheta = combineAngles(r);

            let currentAngle = p.radians
            let targetAngle = resultantTheta + random.float(-.05, .05)

            p.radians = relativeTurnAdd(targetAngle, currentAngle, .1)
        })


    }

    draw(ctx){
        this._i += 1
        this.clear(ctx);
        /*(this._i % 5 == 0) &&*/ this.step()
        // this.ps.pen.indicators(ctx, undefined, 'purple')

        // let subVal = this.subVal
        this.ps.forEach(function(p, i){
            p.pen.line(ctx, undefined, i==1366?'yellow':'red')
        //     // p.velocity.mutableSub({x:subVal, y:subVal})
        //     p.velocity.mutableMul({x:subVal, y:subVal})
        })
    }
}


const relativeTurnAdd = function(targetAngle=1, currentAngle=0, rotationSpeed = 0.1){
    //  find the shortest angular difference
    let diff = targetAngle - currentAngle;
    let PI = Math.PI
    //    b) ensure diff is in [-π, π] so we rotate the shortest way around
    diff = (diff + PI) % (2 * PI) - PI;
    // 3. Move only a fraction, say 1% (0.01) or 5% (0.05) per frame
    return currentAngle + (diff * rotationSpeed);
}


function combineAngles(angles) {
    // Sum of all x,y unit vectors
    let sumX = 0;
    let sumY = 0;

    angles.forEach((theta) => {
        sumX += Math.cos(theta);
        sumY += Math.sin(theta);
    });

    // If everything is zero, we can handle that as a special case
    if (sumX === 0 && sumY === 0) {
        // For instance, default to 0 radians or do something else
        return 0;
    }

    // Calculate the resultant angle
    return Math.atan2(sumY, sumX);
}


stage = MainStage.go(/*{ loop: true }*/)
