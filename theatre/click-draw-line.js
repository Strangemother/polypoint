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
    ../point_src/pointlistpen.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/curve-extras.js
    ../point_src/random.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/within.js
    ../point_src/automouse.js

---

Draw lines through a list of points created by clicks.

As a fun extra, check the mouse is within the drawn polygon with the `withinPolygon` function

 */


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.drawn = []
        this.events.wake()

        this.stroke = new Stroke({
            color: '#eee'
            , width: 1
            , dash: [7, 4]
        })
    }

    onClick(ev, point) {
        if(point == undefined) {
            if(this.line == undefined) {
                this.line = new PointList
            }
            this.line.push(Point.from(ev))
        }
    }

    onDblclick(ev) {
        console.log('double click')
        // this.drawn.push(this.line)
        // this.line = undefined
    }

    onMousedown(ev) {

    }

    onMouseup(ev) {

    }

    onMousemove(ev) {

    }

    draw(ctx){
        this.clear(ctx)

        this.stroke.set(ctx)
        let l = this.line;
        if(l) {
            l.first().pen.circle(ctx)
            l.pen.line(ctx, {color: '#90000'})
        }

        this.drawn.forEach((l)=>{
            l.pen.line(ctx, {color: '#99000'})
        })

        if(l?.length > 2) {

            let within = withinPolygon(this.mouse.point, l)
            if(within) {
                this.mouse.point.pen.fill(ctx, 'green')
            }
        }

        this.stroke.unset(ctx)


    }
}

stage = MainStage.go()
