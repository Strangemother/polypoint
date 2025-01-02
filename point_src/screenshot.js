/*
Add extra methods to the `Scene` to capture screenshots of the canvas.

    stage = (new Stage()).go()
    // creates new image
    stage.screenshot.toNewImage()

Download a jpg file:

    stage = new Stage
    stage.screenshot.asDownloadLink()
    // Click the newly DOM inserted link
*/
class Screenshot {

    constructor(stage) {
        this.stage = stage;
    }

    toBlob(callback) {
        callback = callback || this._stashBlob.bind(this)
        let cb = (blob) => {
            const url = URL.createObjectURL(blob)
            callback && callback(url)
        }

        this.stage.canvas.toBlob(cb);
    }

    _stashBlob(uriBlob) {
        console.log('snapshot stored', uriBlob)
        this.lastStash = uriBlob
    }

    toNewImage() {
        const newImg = document.createElement("img");
        let cb = (url) => {
            newImg.onload = () => { URL.revokeObjectURL(url) };
            newImg.src = url;
            document.body.appendChild(newImg);
        }

        let canvas = this.stage.canvas
        this.toBlob(cb);
    }

    asDownloadLink() {
        const linkObjectUrl = document.createElement("a");
        linkObjectUrl.download="image.jpg"
        linkObjectUrl.innerHTML = 'Download'
        linkObjectUrl.onclick = function(e) {
            setTimeout(()=> URL.revokeObjectURL(linkObjectUrl), 1000)
            linkObjectUrl.remove()
        }

        document.body.appendChild(linkObjectUrl);

        let cb = (url) => {
            linkObjectUrl.href = url
        }

        this.toBlob(cb);
    }

}

Polypoint.head.install(Screenshot)


Polypoint.head.lazierProp('Stage',
    function screenshot() {
        console.log('make screenshot', this)
        return new Screenshot(this)
    }
)

asObjectUrl = async function(width, height, callback) {
    let quality = .8
    let canvas = stage.canvas
    let objectUrl = await canvas.toObjectURL("image/jpeg", quality);
    // let dataUrl = canvas.toDataURL("image/webp", quality);

    // set object URLs
    // linkObjectUrl.href = objectUrl;
    let p = asObjectUrl()
    return p.then((d)=>console.log('got data'));
    return p//.then(console.log);
}

const asObject = async function(mimeType="image/jpeg", quality = 0.85) {
    let promiseFunc = (resolve, reject) => {
        let caller = (blob) => {
            if (!blob) {
                reject("Error creating blob");
                return;
            }

            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
        };

        this.toBlob(caller, mimeType, quality);
    }

    return new Promise(promiseFunc);
};

HTMLCanvasElement.prototype.toObjectURL = asObject;