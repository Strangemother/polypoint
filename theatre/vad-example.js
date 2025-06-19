/*
title: Most Minimal Example
categories: minimal
files:
    head
    point
    stage
    mouse
    ../point_src/easing.js
    ../theatre/vad-wave.js
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/


class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = this.center.copy()
        this.point.radius = 50

        this.color = '#44DD88'
        this.events.on('speechStart', this.onSpeechStart.bind(this))
        this.events.on('speechEnd', this.onSpeechEnd.bind(this))
        this.events.on('frameProcessed', this.onFrameProcessed.bind(this))
    }

    onSpeechStart() {
        console.log('start')
        this.point.radius += 30
        this.color = 'orange'
    }

    onSpeechEnd() {
        console.log('end')
        this.point.radius = 50
        this.color = '#4488DD'
    }

    onFrameProcessed(){
        console.log('frameProcessed')
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.fill(ctx, {color:this.color, width: 3})
    }
}

stage = MainStage.go(/*{ loop: true }*/)

