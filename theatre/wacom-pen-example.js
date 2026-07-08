/*
title: Wacom Pen
categories: Pen
files:
    head
    point
    stage
    ../point_src/events.js
---

The Pen API with pressure and tilt etc.

*/
class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = this.center.copy()
        this.presenter = navigator.ink.requestPresenter({
                presentationArea: this.canvas
        });
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.indicator(ctx)
    }

    async onPointerMove(ev) {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        var tilt = JSON.stringify({ x: ev.tiltX, y: ev.tiltY });

        console.log(`${tilt}  ${ev.pressure}  ${ev.altitudeAngle}  ${ev.pointerType}  ${ev.twist}`);

        this.point.update({
            radius: 15 * ev.pressure
            , x: ev.x
            , y: ev.y
        });
       (await this.presenter).updateInkTrailStartPoint(ev, {
            diameter: 1,
            color: 'red'
        });
    }
}


stage = MainStage.go(/*{ loop: true }*/)

