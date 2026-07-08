/*
title: VAD Waveform Display
*/
async function micMonitorMain() {
    const myvad = await vad.MicVAD.new({
        onSpeechStart(){
            stage.events.emit('speechStart')
        }
        , onFrameProcessed(){
            /*
                probabilities: {
                    isSpeech: float
                    notSpeech: float
                }
                frame: Float32Array
             */
            stage.events.emit('frameProcessed')
        }
        , onVADMisfire(){
            console.log('misfire')
        }
        , onSpeechRealStart(){
            console.log('RealStart')
        }
        // number  0.5 see algorithm configuration
        , positiveSpeechThreshold: 0.3
        // number  0.35    see algorithm configuration
        , negativeSpeechThreshold: .15
        //    number  8   see algorithm configuration
        , redemptionFrames: 8
        //    number  1536    see algorithm configuration
        , frameSamples: 1536
        //  number  1   see algorithm configuration
        , preSpeechPadFrames: 1
        // number  3   see algorithm configuration
        , minSpeechFrames: 3
        //   "v5" or "legacy"    "legacy"    whether to use the new Silero model or not
        , model: 'legacy'

        , onSpeechEnd(audio){
            // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
            stage.events.emit('speechEnd', { audio })
            onSpeechEnd(audio)
        }
    });

    myvad.start()
}


console.log('Run micMonitorMain.')
micMonitorMain()


function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    // Clamp between -1 and 1
    let s = Math.max(-1, Math.min(1, input[i]));
    // Scale to 16-bit signed integer
    s = s < 0 ? s * 0x8000 : s * 0x7FFF;
    output.setInt16(offset, s, true); // little-endian
  }
}


function writeWAVHeader(view, sampleRate, numSamples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // file length - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
}


function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}


function float32ToWavBytes(float32Array, sampleRate = 16000) {
  const numSamples = float32Array.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  writeWAVHeader(view, sampleRate, numSamples);
  floatTo16BitPCM(view, 44, float32Array);

  return buffer;
}


// Usage in your onSpeechEnd:
const onSpeechEnd = (audio) => {
  // audio: Float32Array at 16kHz
  const wavBuffer = float32ToWavBytes(audio, 16000);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  // Play it (or set as src for an <audio> tag)
  const audioEl = new Audio(url);
  audioEl.play();

  // Or, for reuse:
  // document.getElementById('your-audio-element').src = url;

  console.log('Played recorded audio.');
}




