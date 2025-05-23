/*

Version two supplies better functionss and clipping tech.


Add extra methods to the `Scene` to capture screenshots of the canvas.

*/
class Screenshot {

    fileFormat = "image/png" // "image/jpeg"
    fileQuality = .9

    constructor(stage) {
        this.stage = stage;
        // this.toBlobURL = this.toBlob
    }

    _stashBlob(uriBlob) {
        console.log('snapshot stored', uriBlob)
        this.lastStash = uriBlob
    }

    blobURL(blob) {
        return URL.createObjectURL(blob);
    }

    revokeURL(url) {
        return URL.revokeObjectURL(url)
    }

    toBlob(callback=undefined) {
        /* The screenshot toblob */
        callback = callback || this.onScreenshot.bind(this)
        // const url = URL.createObjectURL(blob)
        // Navtive toBlob function call.
        return this.stage.canvas.toBlob((blob) => callback && callback(blob));
    }

    onScreenshot(blob) {
        this._stashBlob(blob)
    }

    createImgElement() {
        const newImg = document.createElement("img");
        this.toBlob((blob)=>{
            let url = this.blobURL(blob)
            newImg.onload = () => { URL.revokeObjectURL(url) };
            newImg.src = url;

            // let cb = (blob) => {
            //     document.body.appendChild(newImg);
            // }
        });
        return newImg
    }


    downloadImage(name='polypoint-screenshot.png'){
        let anchorClick = (blob) => {
            const anchor = document.createElement('a');
            anchor.download = name; // optional, but you can give the file a name
            anchor.href = this.blobURL(blob);
            anchor.click(); // ✨ magic!
            // remove it to save on memory
            setTimeout(()=> {
                let _stage = this
                _stage.revokeURL(anchor.href)
            }, 500)
        }

        return this.toBlob(anchorClick)
    }



    // asDownloadLink(name="polypoint-screenshot.png") {
    //     const linkObjectUrl = document.createElement("a");
    //     linkObjectUrl.download = name
    //     linkObjectUrl.innerHTML = 'Download'
    //     linkObjectUrl.onclick = function(e) {
    //         setTimeout(()=> URL.revokeObjectURL(linkObjectUrl), 1000)
    //         linkObjectUrl.remove()
    //     }

    //     document.body.appendChild(linkObjectUrl);

    //     let cb = (url) => {
    //         linkObjectUrl.href = url
    //     }

    //     this.toBlob(cb);
    // }

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

const asObjectWithCrop = async function(mimeType = "image/jpeg", quality = 0.85, crop = null) {
    const canvas = this;

    const promiseFunc = (resolve, reject) => {
        let targetCanvas = canvas;

        if (crop) {
            const { x, y, width, height } = crop;
            targetCanvas = document.createElement("canvas");
            targetCanvas.width = width;
            targetCanvas.height = height;

            const ctx = targetCanvas.getContext("2d");
            ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
        }

        targetCanvas.toBlob((blob) => {
            if (!blob) {
                reject("Error creating blob");
                return;
            }

            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
        }, mimeType, quality);
    };

    return new Promise(promiseFunc);
};


// HTMLCanvasElement.prototype.toObjectURL = asObjectWithCrop;