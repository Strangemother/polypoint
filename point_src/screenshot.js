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


    toBlobDetectedCropped(background=undefined, borderRadius=10, dimensions=undefined, minimumSize=undefined) {
        let stage = this.stage
            , ctx = stage.ctx
            , d = dimensions || stage.dimensions
            , w = d?.width
            , h = d?.height

        const minWidth = Math.max(0, Math.floor(Number(minimumSize?.width) || 0))
        const minHeight = Math.max(0, Math.floor(Number(minimumSize?.height) || 0))

        const fallbackBlob = () => {
            return new Promise((resolve, reject) => {
                this.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Screenshot capture failed.'))
                        return
                    }

                    resolve(blob)
                })
            })
        }

        if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
            return fallbackBlob()
        }

        if (typeof detectEdges != 'function') {
            return fallbackBlob()
        }

        const initImageData = ctx.getImageData(0, 0, w, h)
        let edges = detectEdges(initImageData.data, initImageData.width)
        const innerPadding = 10
        const contentWidth = edges.width + (innerPadding * 2)
        const contentHeight = edges.height + (innerPadding * 2)
        const hasMinimumWidth = minWidth > 0
        const hasMinimumHeight = minHeight > 0
        const outputWidth = hasMinimumWidth
            ? Math.max(minWidth, edges.width)
            : contentWidth
        const outputHeight = hasMinimumHeight
            ? Math.max(minHeight, edges.height)
            : contentHeight
        const drawX = Math.max(0, Math.floor((outputWidth - edges.width) * .5))
        const drawY = Math.max(0, Math.floor((outputHeight - edges.height) * .5))
        let offscreen = stage?.offscreen?.create?.({
            width: outputWidth,
            height: outputHeight,
        })

        if (!offscreen) {
            offscreen = document.createElement('canvas')
            offscreen.width = outputWidth
            offscreen.height = outputHeight
        }

        const imageData = ctx.getImageData(
            edges.left, edges.top,
            edges.width, edges.height
        )

        let offCtx = offscreen.getContext('2d')
        if (!offCtx) {
            return Promise.reject(new Error('Screenshot crop context unavailable.'))
        }

        if(background != undefined) {
            // Draw background
            offCtx.fillStyle = background
            offCtx.roundRect(0, 0, offscreen.width, offscreen.height, borderRadius)
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
                drawX, drawY, imageData.width, imageData.height
            )
        } else {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
            offCtx.putImageData(imageData, drawX, drawY)
        }

        if (typeof offscreen.convertToBlob == 'function') {
            return offscreen.convertToBlob({
                type: this.fileFormat,
                quality: this.fileQuality,
            })
        }

        return new Promise((resolve, reject) => {
            if (typeof offscreen.toBlob != 'function') {
                reject(new Error('Canvas blob conversion unavailable.'))
                return
            }

            offscreen.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Screenshot capture failed.'))
                    return
                }

                resolve(blob)
            }, this.fileFormat, this.fileQuality)
        })
    }


    downloadCroppedImage(name='polypoint-screenshot.png', background=undefined, borderRadius=10, dimensions=undefined){
        /* grab the placement, and create a new download image with cropping.*/
        this.toBlobDetectedCropped(background, borderRadius, dimensions).then((blob) => {
            const anchor = document.createElement('a')
            anchor.download = name
            anchor.href = this.blobURL(blob)
            anchor.click()
            setTimeout(()=> {
                this.revokeURL(anchor.href)
            }, 500)
        }).catch((error) => {
            console.error('downloadCroppedImage failed:', error)
        })
    }

    downloadCroppedImageAlphaComposite(name='polypoint-screenshot.png',
        background=undefined, borderRadius=10, dimensions=undefined){
        return this.downloadCroppedImage(name, background, borderRadius, dimensions)
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
            const cropWidth = Math.max(1, Math.round(width));
            const cropHeight = Math.max(1, Math.round(height));
            targetCanvas = document.createElement("canvas");
            targetCanvas.width = cropWidth + (innerPadding * 2);
            targetCanvas.height = cropHeight + (innerPadding * 2);
            const ctx = targetCanvas.getContext("2d");
            ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
            // ctx.putImageData(canvas, 0, 0);
            ctx.drawImage(
                canvas,
                x,
                y,
                cropWidth,
                cropHeight,
                innerPadding,
                innerPadding,
                cropWidth,
                cropHeight,
            );
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