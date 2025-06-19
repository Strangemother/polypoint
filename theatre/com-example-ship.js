/*
title: Center of Mass.
category: center
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/compass.js
    ../point_src/center.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/events.js
    ../point_src/stage.js
    ../point_src/automouse.js
    ../point_src/extras.js
    ../point_src/setunset.js
    ../point_src/stroke.js
---

*/


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()

        // update center indicator every 5 frames
        this.onTick(5, this.createMassPoints.bind(this))
    }

    generate(pointCount=4){
        /* Generate a list. In this random... */
        this.randomPoints = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        this.randomPoints.forEach(p => {
                let mass = Math.random() * 10
                // p.mass = mass
                p.rotation = Math.random() * 360
                p.radius = Math.max(5, mass)
            })
        // this.dragging.add(...this.randomPoints)
        this.dragging.addPoints(...this.randomPoints)

        this.velocity = point(0, 0);        // Linear velocity (x, y)
        this.angularVelocity = 0;           // Angular velocity (radians/sec)
        this.position = point(0, 0);        // Center of mass position
        this.rotation = 0;                  // Orientation in radians

        this.createMassPoints()

    }


    createMassPoints(){
        /* Call upon the list "center of mass" function */
        this.comPoint = this.randomPoints.centerOfMass()
        /* In this case we cater for mass and rotation additions */
        this.weightedComPoint = this.randomPoints.centerOfMass('deep')
    }

    draw(ctx){
        this.clear(ctx)
        let dt = 1 / 60; // Or whatever your timestep is

        // Update center of mass position by velocity
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Update rotation by angular velocity
        this.rotation += this.angularVelocity * dt;

        // For each engine:
        for (let p of this.randomPoints) {
            // Find engine's offset from center
            let dx = p.x - this.comPoint.x;
            let dy = p.y - this.comPoint.y;

            // Rotate offset by current orientation
            let cosA = Math.cos(this.rotation);
            let sinA = Math.sin(this.rotation);

            let px = this.position.x + dx * cosA - dy * sinA;
            let py = this.position.y + dx * sinA + dy * cosA;

            // Draw at (px, py)
            // e.g., ctx.circle(px, py, p.radius)
        }

        let totalMass = 0;
        let center = this.weightedComPoint

        // Moment of inertia (about center), for point masses:
        let I = 0;
        for (let p of this.randomPoints) {
            let dx = p.x - center.x;
            let dy = p.y - center.y;
            let mass = p.radius; // or p.mass if you store it
            totalMass += mass;
            I += mass * (dx * dx + dy * dy);
        }
        if (I === 0) I = 1; // hack to avoid NaN


        // 1. For each engine, calculate and apply force
        for (let p of this.randomPoints) {
            // Define your force here (e.g. thrust direction, magnitude)
            let force = {x:0, y:5}
            this.applyForceAtPoint(force, p, center, totalMass, I);
        }

        // 2. Update position & rotation
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.rotation += this.angularVelocity * dt;


        // this.weightedComPoint.rotation = this.rotation
        // 3. Recompute center of mass, moment of inertia, etc if needed

        // 4. Draw points at their rotated/translated positions

        /* Use the pen to draw a simple circle at the Center of Mass.*/
        this.comPoint.pen.circle(ctx, undefined, 'teal', 3)
        /* Draw an indicator at the _weighted_ Center of Mass. */
        this.weightedComPoint.pen.indicator(ctx)
        /* Draw a circle at the origin points */
        this.randomPoints.pen.indicators(ctx, this.rawPointConf)
    }

    applyForceAtPoint(force, point, center, totalMass, momentOfInertia) {
        // Linear acceleration
        this.velocity.x += force.x / totalMass;
        this.velocity.y += force.y / totalMass;

        // Torque (for angular acceleration)
        const rx = point.x - center.x;
        const ry = point.y - center.y;
        const torque = rx * force.y - ry * force.x; // 2D cross product

        const angularAcc = torque / momentOfInertia;
        this.angularVelocity += angularAcc;
    }


}

stage = MainStage.go()
