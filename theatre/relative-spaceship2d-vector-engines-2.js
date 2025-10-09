/*
categories: relative
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    pointlist
    stroke
    ../point_src/events.js
    ../point_src/text/beta.js
    ../point_src/automouse.js
    ../point_src/relative.js
    ../point_src/keyboard.js
*/

// Function to convert angle to velocity vector
function angleToVelocity(theta, speed) {
  return {
    x: speed * Math.cos(theta),
    y: speed * Math.sin(theta)
  };
}



class MainStageKeys extends Stage {
    setupKeys(){

        this.keyboard.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        this.keyboard.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        this.keyboard.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        this.keyboard.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        this.keyboard.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))
        this.keyboard.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))
        // this.keyboard.onKeyPress(KC.SPACE, this.onSpaceKeyPress.bind(this))

    }

    onUpKeydown(ev) {
        /* On keydown we add some to the throttle.
        As keydown first repeatedly, this will raise the power until
        keyup */
        this.powerDown = true
    }

    onUpKeyup(ev) {
        /* Reset the throttle */
        this.powerDown = false
    }

    onDownKeydown(ev) {
        // this.speed -= .1
        this.reverseDown = true
        // this.speed -= 1
        // this.a.relative.backward(20)
        // this.a.relative.forward(-20)
    }

    onDownKeyup(ev) {
        this.reverseDown = false
    }

    onLeftKeydown(ev) {
        /* Rotate the point as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateSimpleShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ left */
            this.impart(.02, new Point(0, -1))
            return
        }

        this.rotationSpeed -= 1
    }

    onRightKeydown(ev) {
        /* Rotate the point as if spinning on the spot.
        This rotation Speed is applied constantly in `this.updateSimpleShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ right */
            this.impart(.02, new Point(0, 1))
            return
        }

        this.rotationSpeed += 1
    }

    onSpaceKeyPress(ev){}

}


class MainStagePlainShip extends MainStageKeys {

    setupSimpleShip() {
        this.a = new Point({ x: 300, y: 300, vx: 0, vy: 0})
        this.a.update({radius: 10})
        this.rotationSpeed = 0
        this.power = 0
        this.powerDown = false

    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx
        point.y += point.vy
        return
    }

    performPower(){
        if(this.powerDown === true) {
            /* Applied here, bcause a spaceship only applied force when the thottle is on.*/
            // console.log('power', this.power)
            // this.power += .008
            // this.impart(this.power)
            this.impart(.01)
            return
        }

        this.power = 0

        if(this.reverseDown === true) {
            this.impart(-.01)
        }
    }

    impart(speed=1, direction=new Point(1,0)){
        /* Impart _speed_ for momentum relative to the direction the the point.

        For example - pointing _right_ and applying the _{1,0}_ direction (denoting forward)
        will push the point further right, applying _{0, 1}_ pushes the point _left_
        relative to its direction.

        Or to rephase, imagine a engine on the back of the point - pushing _forward_.
        */
        let a = this.a
        const r = impartOnRads(a.radians, direction)
        a.vx += r.x * speed;
        a.vy += r.y * speed;
    }

    updateSimpleShip(){
        let a = this.a;
        a.rotation += this.rotationSpeed
        this.rotationSpeed *= .99
        /* We could constantly push here - however without motion dampening
        it's likely you'll always drift
        (in the direction of radians - like a leaky engine) */
        // this.impart(this.power)

        this.addMotion(a, this.speed)
        this.performPower()
    }
}


function applyEngineForces(ship, engines) {
    for (let engine of engines) {
        const { x, y, radians, force } = engine;

        // 1. Calculate force vector
        const fx = Math.cos(radians) * force;
        const fy = Math.sin(radians) * force;

        // 2. Apply linear motion
        ship.vx += fx;
        ship.vy += fy;

        // 3. Calculate torque
        const dx = engine.x - ship.x;
        const dy = engine.y - ship.y;

        // Torque = r × F (cross product in 2D is scalar)
        const torque = dx * fy - dy * fx;

        // 4. Apply rotational force
        ship.rotationSpeed += torque// * 0.1; // scale for realism
    }
}

function applyEngineForcesCOM(ship, engines, com = { x: ship.x, y: ship.y }) {
    let fxTotal = 0, fyTotal = 0;
    let torqueTotal = 0;
    for (let engine of engines) {
        const { x, y, radians, force } = engine;

        // 1. Calculate force vector
        const fx = Math.cos(radians) * force;
        const fy = Math.sin(radians) * force;

        // 2. Apply linear motion
        // ship.vx += fx;
        // ship.vy += fy;

        // 3. Calculate torque relative to center of mass
        const dx = engine.x - com.x;
        const dy = engine.y - com.y;

        // const torque = dx * fy - dy * fx;

        // 4. Apply rotational force
        // ship.rotationSpeed += torque// * 0.001; // torque scale factor

        fxTotal += fx;
        fyTotal += fy;
        torqueTotal += dx * fy - dy * fx;
    }
    ship.vx += fxTotal / ship.mass;
    ship.vy += fyTotal / ship.mass;
    ship.rotationSpeed += torqueTotal / I;
}

function applyEngineForcesCOMMoI(ship, engines, com=computeCenterOfMass(ship, engines)) {
    const I = computeMomentOfInertia(ship, engines, com);

    for (let engine of engines) {
        const { x, y, radians, force } = engine;

        const fx = Math.cos(radians) * force;
        const fy = Math.sin(radians) * force;

        ship.vx += fx;
        ship.vy += fy;

        const dx = engine.x - com.x;
        const dy = engine.y - com.y;

        const torque = dx * fy - dy * fx;

        // Now divide torque by I for rotational acceleration
        const angularAccel = I === 0 ? 0 : torque / I;

        ship.rotationSpeed += angularAccel;
    }
}


function updateEnginePositions(ship, engines, engineOffsets) {
    const cos = Math.cos(ship.radians);
    const sin = Math.sin(ship.radians);


    engines.forEach((engine, i) => {
        const offset = engineOffsets[i];

        // Rotate the offset
        const rotatedX = offset.x * cos - offset.y * sin;
        const rotatedY = offset.x * sin + offset.y * cos;

        // Set engine position
        engine.x = ship.x + rotatedX;
        engine.y = ship.y + rotatedY;

        // Align engine rotation to ship plus its local rotation
        engine.radians = ship.radians + offset.radians;
    });
}


function computeCenterOfMass(ship, engines) {
    let m_ship = ship.mass;
    let totalMass = m_ship + engines.length;

    let x = ship.x * m_ship;
    let y = ship.y * m_ship;

    for (let engine of engines) {
        // x += engine.x * m_engine;
        // y += engine.y * m_engine;
        x += engine.x * engine.mass;
        y += engine.y * engine.mass;
    }

    return {
        x: x / totalMass,
        y: y / totalMass
    };
}

function computeMomentOfInertia(ship, engines, com=computeCenterOfMass(ship, engines)) {

    let I = 0;

    // Ship body contribution
    const dx = ship.x - com.x;
    const dy = ship.y - com.y;
    I += ship.mass * (dx * dx + dy * dy);

    // Engines
    for (let engine of engines) {
        const dx = engine.x - com.x;
        const dy = engine.y - com.y;
        I += engine.mass * (dx * dx + dy * dy);
    }

    return I;
}


class MainStage extends MainStagePlainShip {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0

        this.setupSimpleShip()
        this.setupKeys()
        this.setupVectorShip()
    }

    setupVectorShip(){
        let DIR = 0 // Math.PI / 2
        this.ship = new Point({
            x: this.center.x
            , y: this.center.y
            , vx: 0
            , vy: 0
            , radians: 0
            , rotationSpeed: 0
            , radius: 15
            , mass: 20
        })

        this.engineOffsets = [
            // Radians are relative to the ship
            { x: 150, y: 0, radians: DIR },
            { x: -150, y: 0, radians: -DIR },
            // { x: -50, y: 50, radians: DIR },
            // { x:  50, y: 50, radians: 0 },
            // { x: -50, y: -50, radians: 0 },
            // { x:  50, y: -50, radians: 0 }
        ]

        this.engines = new PointList(
                    [100, 200, 10, 0]
                   , [100, 450, 10, 0]
                    // , [200, 200, 10, 90]
                    // , [100, 100, 10, 90]
                    // , [200, 100, 10, 90]
                ).cast();

        this.engines.each.force = 0.00
        this.engines.each.mass = 2
        this.ship.I = computeMomentOfInertia(this.ship, this.engines)

    }

    impart(speed=1, direction=new Point(1,0)){
        /* When the power button is in a direction.*/

        super.impart(speed, direction) // for simple ship
        // for vector ship
        this.engines.forEach((engine, i) => {
            let force = (engine.force + speed)
            engine.force = clamp(force * -2, -100, 100)
        })
    }

    onSpaceKeyPress(ev){
        this.engines.forEach((engine, i) => {
            // console.log('Impart speed', force)
            engine.force = 0
            // engine.label = force
        })
    }

    updateVectorShip() {
        let ship = this.ship;

        // Update engine positions BEFORE applying forces!
        updateEnginePositions(ship, this.engines, this.engineOffsets)

        // Fire engines
        // applyEngineForces(ship, this.engines)
        const com = computeCenterOfMass(ship, this.engines);
        // applyEngineForcesCOM(ship, this.engines, com);
        // applyEngineForcesCOMMoI(ship, this.engines, com);

        // Move ship
        // ship.x += ship.vx;
        // ship.y += ship.vy;

        // Rotate ship
        ship.radians += ship.rotationSpeed;

        const dx = ship.x - com.x;
        const dy = ship.y - com.y;

        const cos = Math.cos(ship.rotationSpeed);
        const sin = Math.sin(ship.rotationSpeed);

        const rotatedDx = dx * cos - dy * sin;
        const rotatedDy = dx * sin + dy * cos;

        ship.x = com.x + rotatedDx;
        ship.y = com.y + rotatedDy;

        this.engines.forEach(e => e.force *= 0.9);
        return
   }

    renderVectorShip(ctx){
        this.engines.pen.indicator(ctx)
        this.engines.forEach(e=>{
            e.text.string(ctx, e.force.toFixed(1))
        });

        this.ship.pen.indicator(ctx)
    }

    draw(ctx) {
        this.clear(ctx)
        ctx.fillStyle = '#ddd'
        this.updateSimpleShip()
        this.a.pen.indicator(ctx)

        this.updateVectorShip(ctx)
        this.renderVectorShip(ctx)
    }
}

const stage = MainStage.go()
