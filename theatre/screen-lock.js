/*
title: Screen Lock
*/

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        origin = {x:200, y:200, radius: 20}
        this.point = new Point(origin)
        this.point.origin = origin

        let newRel = this.getScreenXY(origin)
        this.icon = this.point.copy()
        this.icon.copy(newRel)

        this.events.wake()
        this.dragging.add(this.point)//, this.icon)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.tick =0
    }

    getScreenXY(origin) {
        let canvas = this.canvas
        return {
            x:  origin.x - (window.screenLeft + canvas.offsetLeft + canvas.clientLeft)
            , y: origin.y -  (window.screenTop + canvas.offsetTop + canvas.clientTop)
        }
    }

    onDragEnd(ev, point) {
        let canvas = this.canvas
        console.log(point)
        point.origin = this.getScreenXY({x: point.x, y:point.y})
    }

    async onMousedown(ev) {
        /* assign lock.*/

    }

    async onMousemove(ev) {
        // this.point.copy(this.point.add({x:ev.movementX, y:ev.movementY}))
        // console.log(this.getScreenXY(this.point))
    }

    async onMouseup(ev) {
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1

        if(this.tick % 1 == 0) {
            // console.log(this.getScreenXY(this.point))
            let newRel = this.getScreenXY(this.point.origin)
            this.icon.copy(newRel)//.update(newRel)
        }
        this.point.pen.circle(ctx, undefined, '#880000')
        this.icon.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

