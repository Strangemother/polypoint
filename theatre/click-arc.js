/*
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/stage-clock.js
    ../point_src/text/alpha.js
    ../point_src/text/fps.js
    ../point_src/split.js
    stroke
    dragging

 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.additionSpeed = .45

        this.events.wake()
        this.stroke = new Stroke({
            color: 'yellow'
            , width: 4
        })
    }

    onMousedown(ev, point) {
        // console.log('onMousedown', ev)
        let p = point || Point.from(ev)
        p.update({radius: 20})
        this.point = p

        this.stroke.update({color: 'yellow', width: 4})
        this.tickValue = 0
        this.mouseDown = +(new Date)
        this.downPoint = p.copy()
        this.complete = false
        this.unhandled = true
        this.upPoint = undefined
    }

    onMouseup(ev, point) {
        // console.log('onMouseup', ev)
        this.mouseDown = undefined
        let p = point || Point.from(ev)
        this.upPoint = p

        if(this.complete) {
            this.stroke.update({color: '#2299EE'})
            this.activate()
        }
    }

    draw(ctx){
        this.clear(ctx)

        this.spinCon(ctx)
        this.lineProject(ctx,)
        this.fps.drawFPS(ctx);
    }

    lineProject(ctx) {
        let mouse = Point.mouse.position
        let mousePoint = this.upPoint || mouse;
        mouse.pen.indicator(ctx, { color: 'green', width: 3})
        if(this.downPoint) {
            this.isDistant = mousePoint.distanceTo(this.downPoint) > this.point.radius
            if(this.isDistant) {
                this.point.pen.line(ctx, mousePoint)
            }
        }
    }

    spinCon(ctx){
        let p = this.point
        let direction = 0
        let fullCircle = Math.PI2;

        // (zero) points to the right,
        // rotate -1/4 pi
        let spin = -Math.PI * .5

        if(p) {
            this.stroke.set(ctx)
            ctx.beginPath()
            p.draw.arc(ctx,
                    p.radius,
                    this.tickValue,     // Arc amount
                    0 + spin,           // start
                    fullCircle + spin,  // end
                    direction
                );

            ctx.stroke()
            this.stroke.unset(ctx)
        }

        if(this.mouseDown != undefined) {
            this.tickValue += this.additionSpeed
            if(this.tickValue > fullCircle) {
                this.tickValue = fullCircle
                direction = 1
                if(this.unhandled == true) {
                    this.actuate(ctx)
                }
            }
        }

        this.pl?.pen.indicators(ctx, { color: '#22AADD', width: 1})
    }

    actuate(ctx) {
        this.complete = true;
        this.unhandled = false;
        this.stroke.update({color: 'green'})
    }

    activate() {

        this.stroke.update({color: 'grey', width: 1, radius: 50})
        let target = this.point
        let isDistant = this.isDistant
        if(this.isDistant) {
            target = this.upPoint
        }

        let count = isDistant? 3: 6
        let pl = this.pl = target.copy().update({radius: this.point.radius * 3}).split(count)
        pl.each.radius = 10

    }
}

stage = MainStage.go()
