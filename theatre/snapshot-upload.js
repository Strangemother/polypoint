    /*
title: Upload Snapshots
categories: gif
files:
    head
    pointlist
    point
    stage
    mouse
    stroke
    ../point_src/random.js
    ../point_src/easing.js
    ../point_src/iter/lerp.js
    ../theatre/utils/snapshots.js
---

Save many images on the server to generate an animated gif using the backend.
*/

addButton('Start Recording', {
    onclick() {
        stage.startRecord()
    }
})

addButton('Stop Recording', {
    onclick() {
        stage.stopRecord()
    }
})


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        let count = 50
        this.a = PointList.generate.random(count, [200,350, 20, 200], [60, 150, 1, 1])
        this.b = PointList.generate.radius({count, offset: {radius:3}}, 140, new Point(300, 300))
        this.c = PointList.generate.random(count)
        this.isRecording = false
    }

    onMousedown(e) {
        console.log('mousedown')
        this.update()
        this.draw(this.ctx)
        sendImage(this.canvas)
    }

    startRecord() {
        this.isRecording = true
        this.stepRecord()
    }

    stopRecord() {
        this.isRecording = false
    }

    stepRecord() {
        if(this.isRecording) {
            this.update()
            this.draw(this.ctx)
            sendImage(this.canvas).then(this.stepRecord.bind(this))
        }
    }


    draw(ctx) {
        this.clear(ctx, '#010101')

        this.a.pen.indicator(ctx, 'green')
        this.b.pen.indicator(ctx, {color:'#333'})

        this.c.lerper.through(this.a, this.b, {seconds: 5,
                                        easing: linearInOut, fps: 30})
        this.c.pen.indicator(ctx, {color:'purple'})
    }
}


;stage = MainStage.go({
    loop: false
});