/*
files:
    image-edge-detection.js
    offscreen.js
categories: screenshot
---

Version two supplies better functionss and clipping tech.


Add extra methods to the `Scene` to capture screenshots of the canvas.

*/
class Screenshot {

    fileFormat = "image/png" // "image/jpeg"
    fileQuality = .9

    constructor(stage) {
        this.stage = stage
    }

    _stashBlob(uriBlob) {
        this.lastStash = uriBlob
    }

    blobURL(blob) {
        /* Given a _blob_ object, creaate an object url (a base 64 representation
        of the blob) */
        return URL.createObjectURL(blob);
    }

    revokeURL(url) {
        /* Revoke an object url from memory. */
        return URL.revokeObjectURL(url)
    }

    toBlob(callback=undefined) {
        /* Call the `canvas.toBlob` function to screenshot the canvas.
        Provide a callback to override the internal onScreenshot method
        capture function

            toBlob(function(blob){})
        */
        callback = callback || this.onScreenshot.bind(this)
        // const url = URL.createObjectURL(blob)
        // Navtive toBlob function call.
        return this.stage.canvas.toBlob((blob) => callback && callback(blob));
    }

    toBlobCropped(crop, callback){
        callback = callback || this.onScreenshot.bind(this)
        let cb = (blob) => callback && callback(blob)
        // let crop = {x: 200, y:300, width: 30, height: 30}
        let canvas = this.stage.canvas
        return asObjectWithCrop.bind(this.stage)(canvas, this.fileFormat, this.fileQuality, crop)
        // return this.stage.canvas.toBlob(cb)
    }

    onScreenshot(blob) {
        this._stashBlob(blob)
    }

    createImgElement() {
        /* generate a new `<img>` with the src as a new blob of the canvas.
        Append to the body to present.
        */
        const newImg = document.createElement("img");
        this.toBlob((blob)=>{
            let url = this.blobURL(blob)
            newImg.onload = () => { URL.revokeObjectURL(url) };
            newImg.src = url;
        });
        return newImg
    }

    downloadImage(name='polypoint-screenshot.png'){
        /* Perform an image _download_ of the canvas, rendered through toBlob
        This will push a new file to the client.
        */
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


    downloadCroppedImage(name='polypoint-screenshot.png', background=undefined, borderRadius=10, dimensions=undefined){
        /* grab the placement, and create a new download image with cropping.*/
        if(background != undefined) {
            return this.downloadCroppedImageAlphaComposite(name, background, borderRadius, dimensions)
        }

        let stage = this.stage
            , ctx = stage.ctx
            , d = dimensions || stage.dimensions
            , w = d.width
            , h = d.height

        const initImageData = ctx.getImageData(0, 0, w, h)
        let edges = detectEdges(initImageData.data, initImageData.width)
        const innerPadding = 10
        let offscreen = stage.offscreen.create({
                width: edges.width + (innerPadding * 2)
                , height: edges.height + (innerPadding * 2)
            })

        const imageData = ctx.getImageData(
            edges.left, edges.top,
            edges.width, edges.height
        )
        let offCtx = offscreen.getContext('2d')
        offCtx.rect(0, 0, edges.width + (innerPadding * 2), edges.height + (innerPadding * 2));
        offCtx.fillStyle = '#222'
        offCtx.fill()
        // offCtx.drawImage(offscreen,  innerPadding,+ innerPadding, edges.width, edges.height, 0, 0, edges.width, edges.height);
        offCtx.putImageData(imageData, 0 + innerPadding, 0 + innerPadding);

        setTimeout(()=>{
            let cb = (blob) => {
                const anchor = document.createElement('a');
                anchor.download = name
                anchor.href = this.blobURL(blob);
                anchor.click()
                let _stage = this
                // setTimeout(()=> _stage.revokeURL(anchor.href), 1000)
                setTimeout(()=> {
                    let _stage = this
                    _stage.revokeURL(anchor.href)
                }, 500)
            }

            offscreen.convertToBlob().then(cb);
        }, 1)

    }

    downloadCroppedImageAlphaComposite(name='polypoint-screenshot.png',
        background=undefined, borderRadius=10, dimensions=undefined){
        let stage = this.stage
            , ctx = stage.ctx
            , d = dimensions || stage.dimensions
            , w = d.width
            , h = d.height

        const initImageData = ctx.getImageData(0, 0, w, h)
        let edges = detectEdges(initImageData.data, initImageData.width)
        const innerPadding = 10
        let offscreen = stage.offscreen.create({
            width: edges.width + (innerPadding * 2),
            height: edges.height + (innerPadding * 2)
        })

        const imageData = ctx.getImageData(
            edges.left, edges.top,
            edges.width, edges.height
        )

        let offCtx = offscreen.getContext('2d')

        // Draw background
        offCtx.fillStyle = background
        // offCtx.fillRect(0, 0, offscreen.width, offscreen.height)
        offCtx.roundRect(0, 0, offscreen.width, offscreen.height, 10)
        offCtx.fill()
        // Create temp canvas for proper blending
        let tempCanvas = document.createElement('canvas')
        tempCanvas.width = imageData.width
        tempCanvas.height = imageData.height
        let tempCtx = tempCanvas.getContext('2d')
        tempCtx.putImageData(imageData, 0, 0)

        // Draw blended image on top
        offCtx.drawImage(
            tempCanvas,
            0, 0, imageData.width, imageData.height,
            innerPadding, innerPadding, imageData.width, imageData.height
        )

        setTimeout(()=>{
            let cb = (blob) => {
                const anchor = document.createElement('a');
                anchor.download = name
                anchor.href = this.blobURL(blob);
                anchor.click()
                let _stage = this
                // setTimeout(()=> _stage.revokeURL(anchor.href), 1000)
                setTimeout(()=> {
                    let _stage = this
                    _stage.revokeURL(anchor.href)
                }, 500)
            }

            offscreen.convertToBlob().then(cb);
        }, 1)

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
    // return p//.then(console.log);
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

const asObjectWithCrop = async function(canvas, mimeType = "image/jpeg", quality = 0.85, crop = null) {
    // const canvas = this;
    const innerPadding = 20;

    const promiseFunc = (resolve, reject) => {
        let targetCanvas = canvas;

        if (crop) {
            const { x, y, width, height } = crop;
            targetCanvas = document.createElement("canvas");
            targetCanvas.width = width + innerPadding;
            targetCanvas.height = height + innerPadding;
            const ctx = targetCanvas.getContext("2d");
            ctx.rect(0, 0, width, height);
            ctx.fillStyle = '#222'
            ctx.fill()
            // ctx.putImageData(canvas, 0, 0);
            ctx.drawImage(canvas, x + innerPadding, y + innerPadding, width, height, 0, 0, width, height);
        }

        targetCanvas.toBlob((blob) => {
            if (!blob) {
                reject("Error creating blob");
                return;
            }

            // const blobUrl = URL.createObjectURL(blob);
            // resolve(blobUrl);

            resolve(blob);
        }, mimeType, quality);
    };

    return new Promise(promiseFunc);
};


// HTMLCanvasElement.prototype.toObjectURL = asObjectWithCrop;