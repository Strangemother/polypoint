/*
title: Pixel Rounding Fix
*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.events.wake()
    }

    onClick(ev) {
        this.point.copy(Point.from(ev))
        console.log(this.point.x, this.point.y)
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.fill(ctx, '#880000')
    }
}

stage = MainStage.go(/*{ loop: true }*/)
