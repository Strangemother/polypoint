/* An 'emitter' generates points with a velocity
This requires some sort of reactor to push the particles.

A single point can emit through an one direction, arc, or full pi
a line emits along it.

Each can be performed with split lerp.

    e = new Emitter(200, 300) //point
    e = new Emitter(Line) // alone a spline.
    newPoints = e.step()
    allPoints = e.points

*/


class Emitter extends Point {

    /* Every step performs a tick, used as the internal clock for
    generate and stepping */
    tick = 0

    // Every modulo to run an emission
    tickModulo = 20

    /* Speed of a single particle (+vx, +vy)*/
    particleSpeed = 2

    /*birthrate = how many particles over X*/
    birthrate = 1

    // speed = XY velocities of particles.
    // lifetime = age of particle before force death
    //
    // birth position = where across the line or point to render.
    //
    // Then we need point motion;
    //  rotation over time.
    //  some mutator (Value(smooth))

    /* Lifetime of a particle. If undefined, it's 50% the radius.*/
    lifetime = undefined //300

    // Emit from the center or the radius.
    fromEdge = false

    /* Which direction should a point emit, e.g. _forward_ (1,0) relative
    of the indicator.*/
    direction = {x:1, y:0}

    pointLimit = 2000

    wake() {
        this.points = new PointList
        this.direction = new Point(this.direction)
    }

    step() {
        /* perform a tick for every interval, creating points, and pushing
        existing points */
        this.tick += 1

        if(this.tick % this.tickModulo == 0) {
            this.cycle()
        }

        this.points = PointList.from(this.points.filter((p)=> p.age < p.lifetime))
        this.points.forEach((p)=>{
            p.x += p.vx
            p.y += p.vy
            p.age += 1
        })
    }

    cycle() {
        /* Perform a task of one step, involving birthing, and killing
        points, selecting and rotation lerp points.*/
        let l = this.points.length
        if(l > this.pointLimit) { return }
        let birthrate = this.birthrate
        for (var i = 0; i < birthrate; i++) {
            let p = this.newPoint(i/birthrate)
            this.pump(p, i, birthrate)
            this.offsetSpawnedPoint(p, i, birthrate)
            this.points.push(p)
        }

        l = this.points.length
        if(this.lastCount != l) {
            // console.log('Point length', l)
            this.length = l
        }

        this.lastCount = l
    }

    pump(p, birthIndex, birthrate) {
    }

    newPoint(birthPartial) {
        /* Return a _ready to go_ point, using the local attributes
        as a template to produce the new point.

        This should include speed and any variants. */
        let fromEdge = this.fromEdge;
        let p = (fromEdge?this.project():this).copy()
        let v = this.particleSpeed //* (3 * Math.random())
        let FORWARD = this.direction
        // create a vector in the direction of the nose
        // x=1 as forward is across to the right (0deg) by default.
        const rotatedDir = impartOnRads(this.radians, FORWARD)

        let lifetime = this.lifetime;
        if(lifetime == undefined) {
            lifetime = this.radius * .5;
        }

        p.update({
            age: 0
            , radius: 5// 1 + Math.random() * 10
            , lifetime: lifetime// * Math.random()
            , vx: rotatedDir.x * v
            , vy: rotatedDir.y * v
        })

        return p
    }

    offsetSpawnedPoint(p){
        if(this.spawnOffset) {
            // debugger
            const _moved = impartOnRads(p.radians, new Point({x: -1, y:0}))
            p.x += _moved.x * p.radius - (p.vx * this.particleSpeed)
            p.y += _moved.y * p.radius - (p.vy * this.particleSpeed)
        }
    }
}


class LineEmitter extends Emitter {

    radiusVariant = 2
    minSize = 5
    directionVariant = 5

    wake() {
        this.index = 0
        console.log('Wake')
        super.wake()
    }

    cachePoints(line, divider=1, pointing=90) {
        // console.log('Cache Points')
        this.positions = line.split(line.length * divider, pointing)
        this.lineLength = line.length
    }

    newPoint(birthPartial) {
        let choice = this.getChoice()

        let template = this.positions[choice]
        if(!template) {debugger}
        let p = template.copy()
        let v = this.particleSpeed //* (3 * Math.random())

        let FORWARD = this.direction
        // create a vector in the direction of the nose
        // x=1 as forward is across to the right (0deg) by default.
        const rotatedDir = impartOnRads(p.radians, FORWARD)

        let lifetime = this.lifetime;
        if(lifetime == undefined) {
            lifetime = this.lineLength * .5;
        }

        p.update({
            age: 0
            , radius: 5// 1 + Math.random() * 10
            , lifetime: lifetime// * Math.random()
            , vx: rotatedDir.x * v
            , vy: rotatedDir.y * v
        })

        return p
    }

    getChoice(){
        // let choice = (this.index++) % this.positions.length
        let l = this.positions.length
        let choice = (Math.random() * l).toFixed(0)
        if(choice >= l) { choice = l - 1}
        if(choice < 0) { choice = 0}
        return choice
    }

    pump(point, birthIndex, birthrate) {
        let partial = birthIndex / birthrate
        let v = ((1+ partial) * (1+birthIndex)  * Math.random()) * this.directionVariant
        let s = ((1+ partial) * (1+birthIndex)  * Math.random()) * 1
        point.rotation += v * (Math.random()>.488? -1: 1)


        let FORWARD = this.direction
        // create a vector in the direction of the nose
        // x=1 as forward is across to the right (0deg) by default.
        const rotatedDir = impartOnRads(point.radians, FORWARD)

        point.update({
            radius: clamp(random.int(this.radius * this.radiusVariant), this.minSize, 10)
            , vx: rotatedDir.x * s
            , vy: rotatedDir.y * s
            , lifetime: point.lifetime * (Math.random() * 2)
        })

        return point
    }

}


class RandomPointEmitter extends Emitter {

    /* Per birth, how much should the radius vary for each point.
    from the minSize to the max (point radius) */
    radiusVariant = .1
    /* A rotation variant for the emitter per birth. between 0 and full rotation 360 */
    directionVariant = 1
    /* minimum particle size */
    minSize = 2

    pump(point, birthIndex, birthrate) {
        let partial = birthIndex / birthrate
        let v = ((1+ partial) * (1+birthIndex)  * Math.random()) * this.directionVariant
        this.rotation += v
        point.radius = clamp(random.int(this.radius * this.radiusVariant), this.minSize, this.radius)
    }

}


class PumpRandomPointEmitter extends RandomPointEmitter {
    fromEdge = true
    tickModulo = 90
    birthrate = 50
    lifetime = 300
    radiusVariant = .1
    directionVariant = 360
    minSize = 2
}


class DirectionalPointEmitter extends RandomPointEmitter {
    directionVariant = .05
    particleSpeed = .6
    lifetime = 200
    fromEdge = true
    tickModulo = 5
    //  speed = 100
    birthrate = .1
    pointLimit = 1000

    invert = false
    stepDirection(multplier){
        return this.speed2D.direction(multplier)
    }

    step(direction, speedFloat, point){
        super.step()
        let invert = 1 + (-2 * +this.invert)
        direction = direction == undefined? this.stepDirection(invert): direction
        speedFloat = speedFloat == undefined? this.speed2D.absFloat(): speedFloat
        this.rotation = 90 - radiansToDegrees(direction)

        let v = speedFloat == undefined ? Math.abs(direction[0])+Math.abs(direction[1]): speedFloat
        let vh = (v * .5)
        this.birthrate = v < 1? 0: .1
        // this.birthrate = vh * .3
        this.particleSpeed = 1 + (vh * .1)
        this.radiusVariant = .1 + (vh * .02)

        if(point) {
            this.lifetime = (this.distanceTo(point) - vh) * .4
        }
    }
}


class TrailPointEmitter extends DirectionalPointEmitter {
    invert = true
    // tickModulo = 5
}

