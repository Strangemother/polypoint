/*
title: Grid Panning
files:
    head
    point
    pointlist
    ../point_src/extras.js
    ../point_src/math.js
    stage
    mouse
    dragging
    stroke
 */

// var gravity = {x: 0, y:-0.05}; // Gravity constant for helium balloon.
var gravity = {x: 0, y:1}; // Gravity constant

class GridPlane {
    constructor(dimensions) {
        this.dimensions = dimensions
    }

    mounted(pin, point) {
        this.move = 0
        this.panning = {
            speed: {x: 0, y:0 }
            , cached: {x:0, y:0}
            , track: false
            , tick: 0
        }
        this.padding = {
            top: 50
            , left: 60
            , right: 400
            , bottom: 50
            , get x() {
                return this.left
            }
            , get y() {
                return this.bottom
            }
        }

        this.pin = pin
        this.point = point
    }

    trackDown(evPoint) {
        this.panning.track = true
        let s = evPoint
        let c = this.panning.cached
        s.x += c.x
        s.y += c.y
        this.panning.start = s
        // this.panning.startTime = +(new Date)
        this.lastPoint = evPoint
        this.panning.tick = 0
        this.panning.speed = { x: 0, y: 0}
    }

    trackUp(evPoint) {
        let p = this.panning
        p.track = false
        p.end = evPoint
        p.cached = p.start.distance2D(p.end)
        // p.endTime = +(new Date)
        // p.speed = evPoint.distance2D(this.lastPoint)
        // this.lastPoint = evPoint
    }

    panPlane(other){
        /* The sensitivity of the panning after the touch is complete. */
        let panSensitivity = .4
        let speedReduction = .96
        let pullReduction = -.001
        let panTick = 3

        let b = this.panning.cached

        if(this.panning.track == true) {
            b = this.updatePanning(other, panTick, panSensitivity)
        }

        let speed = this.panning.speed
        if(speed != undefined) {
            speed = this.updateSpeed(speed, speedReduction, pullReduction)
        }

        return b
    }

    updatePanning(_other, panTick, panSensitivity) {
        this.panning.tick += 1;

        let b = this.panning.start.distance2D(_other)

        if(this.panning.tick % panTick == 0) {
            // console.log('tick', this.panning.tick)
            let speed = this.panning.speed = this.lastPoint.distance2D(_other)
            speed.x = ~~(speed.x * panSensitivity)
            speed.y = ~~(speed.y * panSensitivity)
            this.lastPoint = _other.copy()
        }

        return b
    }

    updateSpeed(speed, speedReduction, pullReduction) {
        speed.x *= speedReduction
        speed.y *= speedReduction
        let pin = this.pin
        let other = this.point
        let dr = other.distance2D(pin)
        speed.x += (dr.x * pullReduction)
        speed.y += (dr.y * pullReduction)
        return speed;
    }

    drawLines(ctx, boxWidth=20, offset={x:0,y:0, skew: 40}) {
        let {width, height} = this.dimensions
        let skew = offset.skew? offset.skew: 0
        let speed = this.panning.speed

        if(speed && this.panning.track == false) {
            offset.x += speed.x
            offset.y += speed.y
        }

        let ticker = {
                x: -(offset.x % boxWidth)
                , y: -(offset.y % boxWidth)
            }

        let drawing = {
              x: ticker.x < width
            , y: ticker.y < height
        }

        let maxcount = {
              x:( width / boxWidth ) + 4
            , y:( height / boxWidth ) + 4
        }

        let padding = this.padding
        const boxContainer = function(color='#000'){
            /* Box for contained. */
            ctx.moveTo(padding.left, padding.top)
            ctx.lineTo(padding.left, height - padding.bottom)
            ctx.lineTo(width - padding.right, height - padding.bottom)
            ctx.lineTo(width - padding.right, padding.top)
            ctx.lineTo(padding.left, padding.top)

            quickStrokeWithCtx(ctx, color)
        }

        const _drawTopDownLine = function(xIndex, skew=0) {
            /* Draw line from top to bottom, at left X index pixels.*/
            ctx.moveTo(xIndex, padding.top)
            ctx.lineTo(xIndex + skew, height - padding.bottom)
        }

        const _drawLeftRightLine = function(yIndex, skew=0) {
            /* Draw line across, from left to right, at the an index from the top. */
            ctx.moveTo(padding.left, yIndex)
            ctx.lineTo(width - padding.right, yIndex + skew)
        }

        let i = 0;
        while(drawing.x) {

            ticker.x > padding.left && _drawTopDownLine(ticker.x, skew)
            drawing.x = ticker.x < (width + boxWidth);
            ticker.x += boxWidth
            i++;
            if(i > maxcount.x || ticker.x > width - padding.right){
                drawing.x = false;
                break
            }
        }

        i = 0;
        while(drawing.y) {
            ticker.y > padding.top && _drawLeftRightLine(ticker.y, -skew)

            drawing.y = ticker.y < (height + boxWidth);
            ticker.y += boxWidth
            i++;
            if(i > maxcount.y || ticker.y > height - padding.bottom){
                drawing.y = false;
                break
            }
        }

        quickStrokeWithCtx(ctx, '#333')

        ctx.beginPath();
        boxContainer('#44CCDD')

        ctx.fillStyle = "#FFA500";
        ctx.font = "1rem sans-serif";
        let s = this.panning.speed;
        let js = s? JSON.stringify({
                          x: s.x.toFixed(2)
                        , y: s.y.toFixed(2)
                    }): ''

        ctx.fillText(`lines X = ${i}, speed = ${js}`, 10, 20);
    }
}


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        // this.mouse.position.vy = this.mouse.position.vx = 0

        // new Point({ x: 200, y: 200, radius: 140, vx: 0, vy: 0})
        this.point = this.center.copy().update({radius: 50})
        //new Point({ x: 300, y: 100, vx: 0, vy: 0})
        this.pin = this.center.copy().update({radius: 10})
        this.dragging.add(this.pin, this.point)
        this.plane = new GridPlane(this.dimensions)
        this.plane.mounted(this.pin, this.point)
    }

    onContextmenu(e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return false;
    }

    onMousedown(ev) {
        // console.log('down')
        if(ev.button == 2) {
            this.plane.trackDown(Point.from(ev))
        }
    }

    onMouseup(ev) {
        // console.log('Up')
        if(ev.button == 2) {
            this.plane.trackUp(Point.from(ev))
        }
    }

    draw(ctx) {
        this.clear(ctx);
        let mp = this.mouse.point;
        let b = this.plane.panPlane(mp)
        this.plane.drawLines(ctx, ~~this.point.radius, b)

        let other = this.point
        let pin = this.pin
        other.pen.circle(ctx, {color:'red'})
        pin.pen.indicator(ctx)
    }

}

const stage = MainStage.go()
