/*
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/functions/clamp.js
    // ../others/curve_src/curve.js
    ../point_src/extras.js
    ../point_src/text/alpha.js
    ../point_src/text/fps.js
    ../point_src/curve-extras.js
---

 */


class MainStage extends Stage {
    canvas = 'playspace'
    updateSpeed = 10
    mounted(){
        this.point = new Point(this.center)
        this.modu = 0


        addControl('updateSpeed', {
            field: 'range'
            , label: 'update speed'
            , step: 1
            , max: 200
            , stage: this
            , onchange(ev) {
                /*slider changed. */
                // debugger;
                let sval = ev.currentTarget.value
                this.stage.updateSpeed = parseInt(Math.sqrt(sval)*2)
            }
        })

    }

    draw(ctx) {
        this.clear(ctx)
        this.modu += 1
        this.modu % this.updateSpeed == 0 && this.updateWalker(1, .5)
        this.point.pen.fill(ctx, '#ddd')
    }

    updateWalker(limit=1, max=1) {
        let width = 1024
        let height = 512
        let margin = 10
        let maxMove = width * 0.1 * max
        let x = width * .5
        let y = height * .5
        let precision = 0
        let halfPi = Math.PI / 180

        for (let i = 0; i < limit; i++) {
            let distance = Math.random() * maxMove
            let angle = Math.random() * 360
            let tx = x + distance * Math.sin(halfPi * angle);
            let ty = y + distance * Math.cos(halfPi * angle);
            if( tx > margin
                && tx < (width - margin)
                && ty > margin
                && ty < (height - margin) ) {
                x = +tx.toFixed(precision)
                y = +ty.toFixed(precision)
            }
        }
        this.point.xy = [x,y]
    }

}


stage = MainStage.go(/*{ loop: true }*/)
