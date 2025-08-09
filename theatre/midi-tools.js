/*https://www.recordingblogs.com/wiki/status-byte-of-a-midi-message
*/


function onMIDIMessage(event) {
    /*
    http://midi.teragonaudio.com/tech/midispec/sense.htm


    https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html

        command meaning # param
        0xF0    start of system exclusive message   variable
        0xF1    MIDI Time Code Quarter Frame (Sys Common)
        0xF2    Song Position Pointer (Sys Common)
        0xF3    Song Select (Sys Common)
        0xF4    ???
        0xF5    ???
        0xF6    Tune Request (Sys Common)
        0xF7    end of system exclusive message 0
        0xF8    Timing Clock (Sys Realtime)
        0xFA    Start (Sys Realtime)
        0xFB    Continue (Sys Realtime)
        0xFC    Stop (Sys Realtime)
        0xFD    ???
        0xFE    Active Sensing (Sys Realtime)
        0xFF    System Reset (Sys Realtime)
    */
    let continueProcessing = true
    for (const character of event.data) {
        let v = character.toString(16).toUpperCase()
        let command = `0x${v}`
        let f = messageMap[command]
        if(f == undefined) {
            f = defaultAction
        }

        continueProcessing = f(character, event)

        if(!continueProcessing) {
            console.log('---')
            return
        }
    }
    console.log('---')

}

const defaultAction = function(character, e) {
    let str = `_ [${event.data.length}b]: `;
    let v = character.toString(16).toUpperCase()
    let command = `0x${v}`
    str += `com=${command} (char=${character}): ${event.data}`;
    console.log(str);
    return true
}

const realtimeSense = function(character, e) {
    /* Calculate since last */
    // let v = character.toString(16).toUpperCase()
    // let str = `MIDI sense ${v}`;
    // console.log(str);
    return true
}

const midiNoteNames = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

function getNoteName(noteNumber) {
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = midiNoteNames[noteNumber % 12];
    return `${note}${octave}`;
}


const NOTE_DOWN = "down"
const NOTE_UP = "up"


class EventBase {

    constructor(event) {

        if(event instanceof Event) {
            this.setup.apply(this, event.data)
        } else {
            if(typeof(event) == 'object') {
                this.device = event.device
                if(event.key) {
                    this.setup.apply(this, event.key)
                } else {
                    // assume dict unpack.
                    this.setup.apply(this, [event.type, event.note, event.velocity, event.duration])
                }
            } else {
                // assume array
                this.setup.apply(this, arguments)
            }
        }

        this.timeStamp = event.timeStamp
        this.origin = event
    }

    setup(mType, mKey, mVel, mDur, device){
        // let [mType, mKey, mVel] = struct
        let v = mType.toString(16).toUpperCase()
        this.note = getNoteName(mKey)
        this.direction = mType == 144? NOTE_DOWN: NOTE_UP
        this.velocity = mVel

        this.velocityPercent = ~~((mVel / 127) * 100)
        this.midiType = mType
        this.midiHex = `0x${v}`
        this.midiKey = mKey
        /*0-127*/
        this.midiVelocity = mVel
        this.duration = mDur
        this.keyIndex = this.midiKey - 21
        if(device) {
            this.device = device
        }
    }

    getDeviceOutput() {
        let output = this.origin.target
        if(this.device){
            if(this.device.outputs) {
                return Array.from(this.device.outputs.values())[0];
            }
            output = this.device
        }

        return output
    }

}


class KeyboardNote extends EventBase {
    /*
        new KeyboardNote(event) => event.data == array
        new KeyboardNote({  })
        new KeyboardNote(type, note, velocity, duration)
        new KeyboardNote({ key: [type, note, velocity, duration], device })
        new KeyboardNote({ type, note, velocity, duration, device})
     */
    playNote(note=this.midiKey, velocity=this.velocity, duration=this.duration) {
        /*

            k = new KeyboardNote(0x90, 80, 50, 500, stage.midiAccess)
            k.playNote()
        */
        let output = this.getDeviceOutput()
        output.send([0x90, note, velocity]); // 0x90 = Note On, channel 1, 60 = Middle C, 100 = velocity
        if(duration == undefined) {
            duration = 500
        }
        // Wait, then Note OFF
        setTimeout(() => {
          output.send([0x80, note, 64]); // 0x80 = Note Off, channel 1, 60 = Middle C, 64 = release velocity
        }, duration); // Play for 500ms
    }

    playNoteWithEvents(note=this.midiKey, velocity=this.velocity, duration=this.duration) {
        /*

            let k = new KeyboardNote(0x90, 80, 50, 1000, stage.midiAccess)
            k.playNoteWithEvents()
        */
        let output = this.getDeviceOutput()
        output.send([0x90, note, velocity]); // 0x90 = Note On, channel 1, 60 = Middle C, 100 = velocity
        if(duration == undefined) {
            duration = 500
        }
        // mType, mKey, mVel, mDur, device
        noteDown(0x90, {type: 0x90, note, velocity, duration, device: output})
        // Wait, then Note OFF
        setTimeout(() => {
            output.send([0x80, note, 64]); // 0x80 = Note Off, channel 1, 60 = Middle C, 64 = release velocity
            // mType, mKey, mVel, mDur, device
            noteUp(0x80, {type: 0x80, note, velocity, duration, device: output})
        }, duration); // Play for 500ms
    }

    dispatchInnerEvent() {
        /* The KeyboardNote is also the parent for the sub events */
        let dir = this.direction
        let eventClass = {
            down: (name, o) => {
                e = new KeyboardNoteDown(name, o)
                noteMap.set(o.detail.note, o.detail)
                return e
            }
            , up: (name, o) => {
                let downNote = noteMap.get(o.detail.note)
                e = new KeyboardNoteUp(name, o)
                e.setDownNote(downNote)
                noteMap.delete(o.detail.note)
                return e
            }
        }[dir]

        let name = `keyboardnote${dir}`
        window.dispatchEvent(eventClass(name, {detail:this, bubbles:true}))

        // this.origin.currentTarget.dispatchEvent(new eventClass(name, {detail:this, bubbles:true}))
    }
}

const noteMap = new Map()


// window.addEventListener('keyboardnotedown', (e) => {
//     console.log(e.detail.direction, e.detail)
// })


// window.addEventListener('keyboardnoteup', (e) => {
//     console.log(e.detail.direction, e.detail)
// })

class KeyboardNoteUp extends CustomEvent {
    setDownNote(downNote) {
        // this.duration = this.timeStamp - downNote.timeStamp

        this.detail.duration = this.detail.timeStamp - downNote.timeStamp
    }
}


class KeyboardNoteDown extends CustomEvent {
    duration = -1
}


const noteDown = function(character, e) {
    let kn = new KeyboardNote(e)
    // console.log(kn)
    kn.dispatchInnerEvent()
    // stop processing/
    return false
}

const noteUp = function(character, e) {
    let kn = new KeyboardNote(e)
    // console.log(kn)
    kn.dispatchInnerEvent()
    // stop processing/
    return false
}


const dialValue = function(character, e) {
    const dv = new DialValue(e)
    dv.dispatchInnerEvent()
    // console.log(dv)
    /* Don't emit the later events. */
    return false
}


// const dialPress = function(character, e) {
//     const dv = new DialPress(e)
//     console.log(dv)
//     /* Don't emit the later events. */
//     return false
// }


const indexMap = function(mKey) {
    let m = {
        112: 1
        , 74: 2
        , 71: 3
        , 76: 4
        , 77: 5
        , 93: 6
        , 73: 7
        , 75: 8
        , 114: 9
        , 18: 10
        , 19: 11
        , 16: 12
        , 17: 13
        , 91: 14
        , 79: 15
        , 72: 16

        // , 113: 101
        // , 115: 109
        , 113: 1
        , 115: 9
    }

    return m[mKey]
}



class DialValue extends EventBase {

    setup(mType, mKey, mVel, mDur, device){
        // let [mType, mKey, mVel] = struct
        let v = mType.toString(16).toUpperCase()
        this.index = indexMap(mKey)
        this.midiKey = mKey
        // this.direction = mType == 144? NOTE_DOWN: NOTE_UP
        this.value = mVel

        this.valuePercent = ~~((mVel / 127) * 100)
        this.midiType = mType
        this.midiHex = `0x${v}`
        /*0-127*/
        this.midiVelocity = mVel
        this.duration = mDur
        this.keyIndex = this.midiKey - 21
        if(device) {
            this.device = device
        }
    }

    dispatchInnerEvent() {
        /* The KeyboardNote is also the parent for the sub events */
        let dir = this.valuePercent
        let eventClass = {
            100: (o) => {
                let n = DialPressDown
                let e = new n(n.name.toLowerCase(), o)
                // noteMap.set(o.detail.note, o.detail)
                return e
            }
            , 0: (o) => {
                // let downNote = noteMap.get(o.detail.note)
                let n = DialPressUp
                let e = new n(n.name.toLowerCase(), o)
                // e.setDownNote(downNote)
                // noteMap.delete(o.detail.note)
                return e
            }
        }[dir]

        let defaultFunc = (o) => {
            let n = DialValueChange
            let e = new n(n.name.toLowerCase(), o)
            return e
        }

        let re = (eventClass || defaultFunc)({detail:this, bubbles:true})
        // let name = `${re.name}`
        window.dispatchEvent(re)
        // this.origin.currentTarget.dispatchEvent(new eventClass(name, {detail:this, bubbles:true}))
    }
}


class DialValueChange extends CustomEvent {};
class DialPressDown extends CustomEvent {};
class DialPressUp extends CustomEvent {};


const messageMap = {

    /* yamaha p125a piano */
    '0x80': noteDown
    , '0x90': noteUp
    , '0xFE': realtimeSense

    /* minilab mkII */

    /* dial */
    , '0xB0': dialValue // (char=176): 17
}


function startLoggingMIDIInput(midiAccess) {
    midiAccess.inputs.forEach((entry) => {
        entry.onmidimessage = onMIDIMessage;
    });
}


function listInputsAndOutputs(midiAccess) {
    console.log('Listing inputs and outputs.')

  for (const entry of midiAccess.inputs) {
    const input = entry[1];
    console.log(
      `Input port [type:'${input.type}']` +
        ` id:'${input.id}'` +
        ` manufacturer:'${input.manufacturer}'` +
        ` name:'${input.name}'` +
        ` version:'${input.version}'`,
    );
  }

  for (const entry of midiAccess.outputs) {
    const output = entry[1];
    console.log(
      `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
    );
  }

  console.log('listings complete.')
}


navigator.permissions.query({ name: "midi", sysex: true }).then((result) => {
    if (result.state === "granted") {
        stage.hasMidi = true
    } else if (result.state === "prompt") {
        // Using API will prompt for permission
        console.log('midi prompt permission')
    }
    // Permission was denied by user prompt or permission policy
});


function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    window.dispatchEvent(new CustomEvent('midiAccess', {
        detail: midiAccess
    }))
}

function closeAllMidiAccess(midiAccess) {

    midiAccess.inputs.forEach(port => {
        port.close()
    })

    midiAccess.outputs.forEach(port => {
        port.close()
    })
}

function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
}

// navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
