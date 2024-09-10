function motorRotate(motor, gear, deltaTime=1, speed=1) {
    // Angular velocity of the motor (rotation rate per frame or unit of time)
    // const angularVelocityMotor = motor.rotationSpeed || speed; // Define how fast motor rotates
    const angularVelocityMotor = (speed * .1) * .5; // Define how fast motor rotates

    // Calculate gear's angular velocity based on motor's angular velocity
    //  and their radii
    const angularVelocityGear = -(angularVelocityMotor * motor.radius / gear.radius);

    // Update the rotation of motor and gear based on their angular velocities and deltaTime
    motor.rotation += angularVelocityMotor * deltaTime;
    if(motor.distanceTo(gear) - gear.radius > motor.radius) { return false }
    gear.rotation += angularVelocityGear * deltaTime;
    return true
}

function gearRotate(gearA, gearB, deltaTime=1, speed=1) {
    // Angular velocity of the motor (rotation rate per frame or unit of time)
    // const angularVelocityMotor = motor.rotationSpeed || speed; // Define how fast motor rotates
    const angularVelocityMotor = (speed * .1) * .5; // Define how fast motor rotates

    // Calculate gear's angular velocity based on motor's angular velocity
    //  and their radii
    const angularVelocityGear = -(angularVelocityMotor * gearA.radius / gearB.radius);

    // Update the rotation of gearA and gear based on their angular velocities and deltaTime
    // gearA.rotation += angularVelocityMotor * deltaTime;
    if(gearA.distanceTo(gearB) - gearB.radius > gearA.radius) { return }
    gearB.rotation += angularVelocityGear * deltaTime;
}


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'canvas'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()

        // this.dragging.add(...this.randomPoints)
        this.dragging.addPoints(...this.randomPoints)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
        this.dragging.onWheel = this.onWheel.bind(this)
    }

    generate(pointCount=2){
        /* Generate a list. In this random... */
        this.randomPoints = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        // this.randomPoints.forEach(p => {
        //         p.rotation = Math.random() * 360
        //         p.radius = Math.max(5, 20)
        //     })
        this.randomPoints = new PointList(
           new Point({x:300, y:200, radius: 100}),
           new Point({x:500, y:200, radius: 100}),
           new Point({x:700, y:200, radius: 100}),
        )

        this.randomPoints[0].lookAt(this.randomPoints[1])
        this.randomPoints[1].lookAt(this.randomPoints[0])
        this.randomPoints[2].rotation = 0

    }

    // onDragEnd(){}

    onDragMove(){
    }

    onWheel(ev, p) {
    }

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)
        let ps = this.randomPoints
        let speed = 1
        // ps[0].rotation += speed
        let chained = motorRotate(ps[0], ps[1], this.clock.delta, speed)
        chained && gearRotate(ps[1], ps[2], this.clock.delta, -speed)


        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }
    }

    drawView(ctx){
        /* Draw a circle at the origin points */
        this.randomPoints.pen.indicators(ctx, this.rawPointConf)
        // this.others.pen.indicators(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()