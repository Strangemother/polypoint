
const riverFlowsIntro = [
    64, 69, 71, 68, 69, 71, 76, 73, 71, 69
];

const playRiverFlowsIntro = (output) => {
    let delay = 0;
    const noteLength = 300;  // ms
    const noteGap = 50;      // ms between notes

    riverFlowsIntro.forEach((note, i) => {
        setTimeout(() => {
            output.send([0x90, note, 50]); // Note ON
            setTimeout(() => {
                output.send([0x80, note, 64]); // Note OFF
            }, noteLength);
        }, delay);
        delay += noteLength + noteGap;
    });
};

const riverFlowsHook = [
  69, 68, 69, 64, 69, 68, 69
];

const playRiverFlowsHook = (output) => {
    let delay = 0;
    const noteLength = 300;  // ms per note
    const noteGap = 30;      // ms between notes

    riverFlowsHook.forEach((note, i) => {
        setTimeout(() => {
            output.send([0x90, note, 50]); // Note ON
            setTimeout(() => {
                output.send([0x80, note, 64]); // Note OFF
            }, noteLength);
        }, delay);
        delay += noteLength + noteGap;
    });
};

const bumblebeeNotes = [
    // Let's run up and down chromatically around C5 for 2 octaves
    72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
    83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72,
    71, 70, 69, 68, 67, 66, 65, 64
];


const playBumblebee = (output) => {
    let delay = 0;
    const noteLength = 70;  // ms, really quick
    const noteGap = 50;      // ms between notes

    bumblebeeNotes.forEach((note, i) => {
        let vel = 40 + (Math.random() * 30)
        let duration = delay + (Math.random() * 50)
        setTimeout(() => {
            let k = new KeyboardNote(0x90, note, vel, noteLength, output)
            k.playNoteWithEvents()

        }, duration);
        delay += noteLength + noteGap;
    });
};



const playExample = function(output){
    // Note ON (plays middle C for example)
    output.send([0x90, 60, 100]); // 0x90 = Note On, channel 1, 60 = Middle C, 100 = velocity

    // Wait, then Note OFF
    setTimeout(() => {
      output.send([0x80, 60, 64]); // 0x80 = Note Off, channel 1, 60 = Middle C, 64 = release velocity
    }, 500); // Play for 500ms
}


const playScale = (output) => {
    const notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C D E F G A B C
    notes.forEach((note, i) => {
        setTimeout(() => {
            let vel = 30 + (Math.random() * 20)
            let k = new KeyboardNote(0x90, note, vel, 300, output)
            k.playNoteWithEvents()

            // output.send([0x90, note, vel]);
            // setTimeout(() => {
            //     output.send([0x80, note, 64]);
            // }, 250);
        }, i * 300);
    });
};

const playScaleRaw = (output) => {
    const notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C D E F G A B C
    notes.forEach((note, i) => {
        setTimeout(() => {
            output.send([0x90, note, 30 + (Math.random() * 20)]);
            setTimeout(() => {
                output.send([0x80, note, 64]);
            }, 250);
        }, i * 300);
    });
};