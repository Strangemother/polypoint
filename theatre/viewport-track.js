/*
title: Track one point
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/relative.js
    ../point_src/screenwrap.js
    ../point_src/iter/lerp.js
    ../point_src/smooth-number.js

---

Follow one point. all other points are shifted.

*/


const walkTime = 10

class AutoLerpPoint extends Point {

    tick = 0

    xSet(value) {
        // console.log('set x')
        if(this.newX == undefined) {
            this.newX = new Value(value, value, undefined, true)
        }

        this.startDateX = +(new Date)
        this.endDateX = this.startDateX + walkTime // 1 second

        this.tickX = 0
        let old = this._opts['x']
        this.newX.a = old
        this.newX.b = value
        this.newX.step = 0
        return old
    }

    rotationSet(value) {
        // console.log('set x')
        if(this.newR == undefined) {
            this.newR = new Value(value, value, undefined, true)
        }

        this.startDateRotation = +(new Date)
        this.endDateRotation = this.startDateRotation + walkTime // 1 second

        this.tickRotation = 0
        let old = this._opts['rotation']
        this.newR.a = old
        this.newR.b = value
        this.newR.step = 0
        return old
    }

    onScreenWrapChange(x, y) {
        if(y !== undefined){
            this.newY.a = this.newY.b = y
            this.newY.step = 1
        }
        if(x !== undefined) {
            this.newX.a = this.newX.b = x
            this.newX.step = 1
        }

    }

    ySet(value) {
        // console.log('set y')
        if(this.newY == undefined) {
            this.newY = new Value(value, value, undefined, true)
        }

        this.startDateY = +(new Date)
        this.endDateY = this.startDateY + walkTime // 1 second

        this.tickY = 0
        let old = this._opts['y']
        this.newY.a = old
        this.newY.b = value
        this.newY.step = 0
        return old
    }

    currentSlide(k) {
        if(k == 'x') {
            let width = this.endDateX - this.startDateX
            let slide = 1 - ( this.endDateX - (this.startDateX + this.tickX) )  / width
            return slide;
        }

        if(k == 'y') {
            let width = this.endDateY - this.startDateY
            let slide = 1 - ( this.endDateY - (this.startDateY + this.tickY) )  / width
            return slide;
        }

        if(k == 'rotation') {
            let width = this.endDateRotation - this.startDateRotation
            let slide = 1 - ( this.endDateRotation - (this.startDateRotation + this.tickRotation) )  / width
            return slide;
        }
    }

    step() {
        // let slide = this.currentSlide()
        // console.log(slide)
        this.tick++

        this.tickX++
        this.tickY++
        this.tickRotation++

        this._opts['x'] = this.newX.get(this.currentSlide('x'))
        this._opts['y'] = this.newY.get(this.currentSlide('y'))

        if(this.newR){
            this._opts['rotation'] = this.newR.get(this.currentSlide('rotation'))
        }
    }

    project(distance, rotation, relative=true) {
        if(rotation !== undefined && relative == true) {
            rotation = (this.UP + rotation) % 360
        }
        let np = new Point(projectFrom(this, distance, rotation))
        np.rotation = this.rotation
        return np
    }


}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'
    doTracking = true
    doRotate = true
    doZoom = true

    mounted(){
        let count = 100
        let multiplier = [600, 600, 5, 270]
        let offset = this.center.copy().subtract(multiplier[0] * .5)

        this.points = PointList.generate.random(count, multiplier, offset)
        this.points = this.points.cast(AutoLerpPoint)

        this.points.each.color = ()=>random.color([290, 310], [50,100], [22,50])
        this.points.each.radius = ()=>random.int(1, 15)

        this.targetPoint = 3

        this.points[this.targetPoint].color = 'orange'

        this.dragging.add(this.points[0])
        this.tick = 0
    }

    firstDraw(ctx) {
        ctx.lineCap = 'round'
    }

    randomMove(p=this.point, c=this.center, v=200){
        if(this.tick % random.int(1, 100) == 0) {
            p.relative.forward(random.int(5, 40))
        }

        if(this.tick % random.int(20, 50) == 0) {
            let c = random.int(4, 60)
            p.rotation += random.int(-c, c)
        }

    }

    viewportTrack(ctx, target, others) {
        /* focus on the target by moving the others. */
        // get offset from center.
        let v = this.doTracking
        let t = target.xy
        let c = this.center.xy
        v = [c.x - t.x, c.y - t.y]
        let s = 1 + (this.mouse.wheelSize() * .1)

        if (this.doRotate) {
            this.rotateZoomTranslate(ctx, c, target, s)
        }

        if (this.doTracking) {
            // Shift the canvas to ensure the target is
            // at the center.
            if (!this.doRotate && this.doZoom) {
                this.zoomTranslate(ctx, c, s)
            }
            ctx.translate(...v);
        }
    }

    viewport = {
    
        rotateZoomTranslate(ctx, c, target, s=2) {
            // First we translate to the _center_
            ctx.translate(c.x, c.y);
            // spin opposite to the display direction
            ctx.rotate(-target.radians - (Math.PI * .5))
            ctx.scale(s, s)
            // Move the canvas back to its initial place (now rotated)
            ctx.translate(-c.x, -c.y);
        }
    
        , zoomTranslate(ctx, c, v) {
            ctx.translate(c.x, c.y);
            ctx.scale(v,v)
            ctx.translate(-c.x, -c.y);
        }
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)

        this.screenWrap.performMany(this.points)

        this.points.forEach(p=>{
            this.randomMove(p, this.center, 400)
            p.step()
        })

        this.viewportTrack(ctx, this.points[this.targetPoint], this.points)

        this.points.pen.fill(ctx)
        this.points.pen.lines(ctx, { width: 2, color: '#111' })
        if (this.doTracking) {
            // reset any tranlate or rotate
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

stage = MainStage.go(/*{ loop: true }*/)
