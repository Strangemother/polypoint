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

Integration with a digital piano. Or fundamentally any MIDI device with key notes.

---

In this example we spawn 88 points as key mapped to their relative note.
Playing the key on the piano will highlight an point.

For fun, the KeyNote can also be played on the device. Checkout
`bumblebeeNotes()`
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
        this.points = this.generatePianoPoints()
        this.walkers = new PointList
        this.setupDevice()
    }

    generatePianoPoints(size=88) {
        /* To make this easier we generate many smaller duplicate groups.
        from C to C is a matching set of about 8 groups.

        So we generate a single scale _group_ of 14 possible positions
        and _skip_ the missing  black keys, 5 or 13

        This produces 1 correct group. Then we iterate until we have enough
        keys.

        The first group is a partial (starting from A0). But also is 1 black
        key, _then_ the duplicate iterations.

        Therefore we start the first index _offset_ by the count of keys we
        don't want - which is 10 keys. The remaing 4 possible keys are plotted,
        missing the unwanted 13th note.

        Heh. I just realised why the term "13th note" is a thing...

        ---

        This allows a keyboard of any size and note grouping combination
            (missed keys).


        */
        let osize = 88
            /* Between each point.*/
            , padding = 10
            /* How many possible positions within a group */
            , groupKeyCount = 14
            /* Which keys to skip within a group.*/
            , exludes = {5:true, 13: true}
            /* How many groups are required */
            , groupCount = Math.ceil(size / (groupKeyCount - 2 - 1 - 1) )
            // , groupCount = 9

            /* The result points. */
            , ps = []
            /* The starting offset.*/
            , j = 10

            /* global position (from top) offset.  */
            , yOffset = 100
            /* The width of one scale. */
            , oneGroupWidth = (groupKeyCount  * .5) * (padding + 10)
            ;

        for (var i = 0; i < groupCount; i++) {
            for (j; j < groupKeyCount; j++) {
                let y = yOffset + 20
                /* To make it easier, We flip/flop through keys.
                The _even_ position (white keys) are zero.

                This ensures the _first key_ is the white key.

                All white keys are moved to a pseudo second row.*/
                if(j % 2 == 0) {
                    y += padding
                }

                if(exludes[j] != undefined) {
                    /* skip this key, it's likely a alterating group note.*/
                    continue
                }

                /* The result XY of a point.
                Applied to the pointlist*/
                let d = {
                    x: (j * padding) + 20 + (i * oneGroupWidth)
                    , y: y
                }
                ps.push(d)

                if(ps.length >= size) {
                    break
                }
            }

            j = 0;
        }

        /* Return a ready-to-go PointList([Point, ...])*/
        return PointList.from(ps).cast();
    }


    setupDevice(){
        this.midiAccess = waitMidi
        if(waitMidi) {
            this.setMidiAccess(waitMidi)
        }

        window.addEventListener('keyboardnotedown', (e) => {
            console.log(e.detail.direction, e.detail)
            this.renderKey(e.detail)
        })


        window.addEventListener('keyboardnoteup', (e) => {
            // console.log(e.detail.direction, e.detail)
            this.unRenderKey(e.detail)
        })

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

    renderKey(key) {
        let p = this.points[key.keyIndex]
        p.isDown = true
        p.radius = 5 + (.1 * key.velocityPercent)

        let w = p.copy()
        w.keySpeed = key.velocityPercent
        this.addWalker(w, key.keyIndex)
    }

    addWalker(origin, originIndex) {
        let wp = origin//.copy()
        // wp.origin = origin.xy
        wp.origin = originIndex
        this.walkers.push(wp)
    }

    unRenderKey(key) {
        this.points[key.keyIndex].isDown = false
        this.points[key.keyIndex].radius = 5
    }

    playNote(note=80, velocity=50, duration=500){
        let k = new KeyboardNote(0x90, note, velocity, duration, this.midiAccess)
        k.playNoteWithEvents()
        return k
    }


    outputExample(){
        let output = Array.from(this.midiAccess.outputs.values())[0];
        // playExample(output)
        // playScale(output)
        // playRiverFlowsIntro(output)
        // playRiverFlowsHook(output)
        playBumblebee(output)
    }

    draw(ctx) {
        this.clear(ctx)
        let ps = this.points
        ps.forEach((p,i)=>{
            p.pen.fill(ctx, this.isPlaying(i)? 'red': '#000')
        })

        this.walkers.forEach((p,i)=>{
            p.y -= (p.keySpeed * .02)
            let op = ps[p.origin]
            if(op.isDown){
                p.pen.line(ctx, op, 'green', 2)
            }
            // p.pen.lineTo(ps[i])//.fill(ctx, 'purple')
        });

        this.screenWrap.cullBox(this.walkers, this.walkers.remove.bind(this.walkers))
    }

}



;stage = MainStage.go();