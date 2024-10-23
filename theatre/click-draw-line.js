


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'canvas'

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
        } else {
            debugger
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
