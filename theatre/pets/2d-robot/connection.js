console.log('Connection');

// ; (async () => {
  // const imageFile = document.querySelector("#image").files[0];
  // const stateText = document.querySelector("#state").value;
  // if (!imageFile) throw new Error("Choose an image first.");

  // const image = await new Promise((resolve, reject) => {
  //   const reader = new FileReader();
  //   reader.onload = () => resolve(reader.result);
  //   reader.onerror = () => reject(reader.error);
  //   reader.readAsDataURL(imageFile);
  // });

  // const socket = new WebSocket("ws://localhost:9999/chromite/");
  // socket.addEventListener("open", () => {
    // socket.send(JSON.stringify({state: stateText, image}));
  // });
  // socket.addEventListener("message", ({data}) => {
  //   console.log("WebSocket response:", data);
  // });
// })();



class PolySocket {
    host = 'ws://localhost:9999'
    connect(name) {
        let host = this.host;
        let url = `${host}/${name}/`
        const socket = new WebSocket(url);
        socket.addEventListener("open", (d) => {
            this.open(d)
        });
        socket.addEventListener("message", (data) => {
            // console.log("WebSocket response:", data);
            this.message(data)
        });
        this.socket = socket
    }

    message(ev) {
        let c = ev.data;
        let d = JSON.parse(c)
        // console.log("WebSocket response:", d);
        if (d.answers) {
            this.parseAnswers(d)
        }
    }

    parseAnswers(d) {
        let a = d.answers
        // console.log(a)
        dispatchEvent(new CustomEvent('socket-answers', {detail: a}))
    }

    open(d) {
        console.log('Open')
    }

    send(state, image) {
        const res = JSON.stringify({ state, image })
        this._previous = state;
        this.socket.send(res);
    }

    resend() {
        this.send(this._previous)
    }
};


ps = new PolySocket()
ps.connect('track-robot')
var liveTick = true
var liveTickTimeout = undefined;

const clearTicker = function () {
    clearTimeout(liveTickTimeout)
    liveTickTimeout = undefined;
}

addEventListener('socket-answers', (ev) => {
    let d = ev.detail
    console.log('Socket answer', d.left_power.number, d.right_power.number)
    stage.setTrackPowers(
        (d.left_power.number * .001) * .4,
        (d.right_power.number * .001) * .4,
    )
    if (liveTickTimeout) {
        clearTicker()
    }
    if (liveTick) {
        liveTickTimeout = setTimeout(() => {
            ps.resend()
        }, 1000)
    }
})
