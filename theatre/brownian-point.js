/*
files:
    ../point_src/core/head.js
    ../point_src/point-content.js
    pointlist
    point
    stage
    mouse
    dragging
    stroke
    ../point_src/functions/clamp.js
---

 */


class MainStage extends Stage {
    canvas = 'playspace'
    updateSpeed = 10
    mounted(){
        this.pin = (new Point(this.center)).update({radius: 200})
        this.point = new Point()
        this.modu = 0

        this.dragging.add(this.pin)
        console.log('Mount')
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
        this.modu % this.updateSpeed == 0 && this.updateWalker(this.pin, 1, .5)

        this.pin.pen.fill(ctx, '#222255')
        this.point.pen.fill(ctx, '#ddd')
    }

    updateWalker(position, iterationLimit=1, max=1) {
        let radius = position.radius * 2
        let width = radius
        let height = radius
        let margin = this.point.radius * 2
        let maxMove = width * max
        let x = position.x
        let y = position.y
        // let x = width * .5
        // let y = height * .5
        let precision = 0
        let halfPi = Math.PI / 180

        // for (let i = 0; i < iterationLimit; i++) {
            let distance = Math.random() * maxMove
            let angle = Math.random() * 360
            let tx = x + distance * Math.sin(halfPi * angle)
            let ty = y + distance * Math.cos(halfPi * angle)
            // if( tx > margin
            //     && tx < (width - margin)
            //     && ty > margin
            //     && ty < (height - margin) ) {
                x = +tx.toFixed(precision)
                y = +ty.toFixed(precision)
            // }
        // }
        this.point.xy = [x,y]
    }

}


stage = MainStage.go(/*{ loop: true }*/)
