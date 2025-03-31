/*
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
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/keyboard.js
    ../point_src/relative.js


*/
// Function to convert angle to velocity vector
function angleToVelocity(theta, speed) {
  return {
    x: speed * Math.cos(theta),
    y: speed * Math.sin(theta)
  };
}


class Sectoring {
    /* Each movement through a bound will change the sector
        Assuming a rect space, we can calculate the 2D through vectoring

            [-1, 1]   [0,  1]   [1,  1]

            [-1, 0]    [0,0]    [1,  0]

            [-1, -1]  [0, -1]   [1, -1]

    */

   constructor(stage, point){
        this.stage = stage
        this.point = point
        this.secConst = this.sectorConstants()
        this._origin = [0, 0]
    }

    sectorConstants() {
        return {
            TOP_LEFT: [-1, 1]
            , TOP: [0,  1]
            , TOP_RIGHT: [1,  1]
            , LEFT: [-1, 0]
            , CENTER: [0,0]
            , RIGHT: [1,  0]
            , BOTTOM_LEFT: [-1, -1]
            , BOTTOM: [0, -1]
            , BOTTOM_RIGHT: [1, -1]
        }
    }

    step() {
        let item = this.point
        let bounds = this.stage.dimensions
        let boundry = this.getBound(item, bounds)
        if(boundry) {
            this.moveSector(item, boundry, bounds)
        }
    }

    moveSector(item, boundry, bounds) {
        /* Apply the boundry update. */
        let rel = this._origin
        rel[0] += boundry[0]
        rel[1] += boundry[1]
        this.printSector()

        item.x = item.x - (bounds.width * boundry[0])
        item.y = item.y + (bounds.height * boundry[1])
    }

    listSectors() {
        let sn = (v)=>{
            let n = this.sectorName(v)
            console.log(v, n)
        }

        sn([0, 0])
        sn([0, -1])
        sn([0, -2])
        sn([0, -3])
        sn([0, -4])
        sn([0, -5])

        sn([-1, 0])
        sn([-1, 1])
        sn([-1, 2])
        sn([-1, 3])
        sn([-1, 4])
        sn([-1, 5])

        sn([-1, -1])
        sn([-1, -2])
        sn([1, -2])

        sn([0, 1])
        sn([0, 2])
        sn([0, 3])
        sn([0, 4])
        sn([0, 5])

        sn([1, 1])
        sn([1, 2])
        sn([1, 3])
        sn([1, 4])
        sn([1, 5])

        sn([2, 1])
        sn([2, 2])
        sn([2, 3])
        sn([2, 4])
        sn([2, 5])

    }

    sectorName(o=this._origin){

        let v = [o[0], o[1], -10].map((v)=>(v+10).toString(32))//.reduce((x,y)=> x+y);
        return v.join('')
    }

    printSector(){
        console.log('New sector', this._origin, this.sectorName())
    }

    getBound(item, bounds){
        // check if the position has hit a bound//
        let cs = this.secConst
        let left = 0;
        let top = 0;

        // capture the bound and add to the units relative info
        if(item.x < bounds.left) {
            left += -1
        }

        if(item.x > bounds.right) {
            left += 1
        }

        if(item.y < bounds.top) {
            top += 1
        }

        if(item.y > bounds.bottom) {
            top += -1
        }

        if(top+left == 0) { return }
        return [left, top];
    }
}


class Ship extends Point {

    mount(stage) {
        let kb = stage.keyboard
        kb.onKeydown(KC.UP, this.onUpKeydown.bind(this))
        kb.onKeyup(KC.UP, this.onUpKeyup.bind(this))
        kb.onKeydown(KC.LEFT, this.onLeftKeydown.bind(this))
        kb.onKeydown(KC.RIGHT, this.onRightKeydown.bind(this))
        kb.onKeydown(KC.DOWN, this.onDownKeydown.bind(this))
        kb.onKeyup(KC.DOWN, this.onDownKeyup.bind(this))

        this.rotationSpeed = 0
        this.powerDown = false
        this.reverseDown = false
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
        This rotation Speed is applied constantly in `this.updateShip`
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
        This rotation Speed is applied constantly in `this.updateShip`
        */
        if(ev.shiftKey || ev.ctrlKey) {
            /* Perform a _crab_ right */
            this.impart(.02, new Point(0, 1))
            return
        }

        this.rotationSpeed += 1
    }

    updateShip(){
        let a = this;
        a.rotation += this.rotationSpeed
        this.rotationSpeed *= .99
        /* We could constantly push here - however without motion dampening
        it's likely you'll always drift
        (in the direction of radians - like a leaky engine) */
        // this.impart(this.power)
        this.addMotion(a, this.speed)
        this.performPower()
    }

    addMotion(point, speed=1) {
        /* Because we're in a zero-gravity space, the velocity is simply _added_
        to the current XY, pushing the point in the direction of forced. */
        point.x += point.vx
        point.y += point.vy
    }

    performPower(){
        if(this.powerDown === true) {
            /* Applied here, bcause a spaceship only applied force when the thottle is on.*/
            // console.log('power', this.power)
            // this.power += .008
            // this.impart(this.power)
            this.impart(.01)
        }

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
        let a = this
        const r = impartOnRads(a.radians, direction)
        a.vx += r.x * speed;
        a.vy += r.y * speed;
    }
}


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')

        this.a = new Ship({ x: 200, y: 200, vx: 0, vy: 0})
        this.a.update({radius: 10})
        this.a.mount(this)

        this.sectoring = new Sectoring(this, this.a)

        // this.points = PointList.generate.list(100)
        // let spread = 50;
        // this.points.shape.grid(spread, 10, {x: spread, y: spread})
    }

    draw(ctx) {
        this.clear(ctx)
        this.a.updateShip()
        this.a.pen.indicator(ctx)
        // this.points.pen.indicators(ctx)
        this.sectoring.step()
    }
}

const stage = MainStage.go()
