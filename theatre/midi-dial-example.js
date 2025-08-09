/*
title: MIDI Actions.
categories: midi
files:
    head
    pointlist
    point
    stage
    stroke
    mouse
    dragging
    ../point_src/random.js
    ../theatre/midi-tools.js
    ../theatre/midi-tracks.js
    ../point_src/screenwrap.js
---


*/

var waitMidi;
var stage;

window.addEventListener('midiAccess', (e)=>{
    if(stage){
        stage.setMidiAccess(e.detail);
    } else {
        waitMidi = e.detail
    }
});


class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        this.hasMidi = undefined
        this.setupDevice()

        this.dials = PointList.generate.grid(16, 8)
    }

    requestAccess(f){
        console.log('Requesting for access')

        navigator.requestMIDIAccess().then(f, (m)=>{
                console.error(`Failed to get MIDI access - ${m}`);
            }
        );
    }

    setupDevice(){
        this.midiAccess = waitMidi
        if(waitMidi) {
            this.setMidiAccess(waitMidi)
        } else {
            this.requestAccess(e=>{
                stage.setMidiAccess(e);
            })
        }

        window.addEventListener('dialpressdown', (e) => {
            console.log(e.detail, e)
        })

        window.addEventListener('dialpressup', (e) => {
            console.log(e.detail, e)
        })

        window.addEventListener('dialvaluechange', (e) => {
            console.log(e.detail)
            let d = e.detail
            let dial =this.dials[d.index-1]

            if(dial){
                dial.rotation = (d.valuePercent * .01) * 360
            }
        })

        // window.addEventListener('keyboardnotedown', (e) => {
        //     console.log(e.detail.direction, e.detail)
        //     this.renderKey(e.detail)
        // })


        // window.addEventListener('keyboardnoteup', (e) => {
        //     // console.log(e.detail.direction, e.detail)
        //     this.unRenderKey(e.detail)
        // })

    }

    setMidiAccess(midiAccess) {
        console.log('midi set')
        this.midiAccess = midiAccess
        listInputsAndOutputs(midiAccess)
        startLoggingMIDIInput(midiAccess)
    }

    isPlaying(i) {
        return this.points[i].isDown
    }

    draw(ctx) {
        this.clear(ctx)
        this.dials.pen.indicators(ctx)
    }
}



;stage = MainStage.go();