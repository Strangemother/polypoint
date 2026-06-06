/* Functions and utilities to assist with offscreen rendering */

function createOffscreenCanvas(whUnit) {
    /* Provide something with a {width, height} for size. */
    // var offScreenCanvas = document.createElement('canvas');
    const offScreenCanvas = new OffscreenCanvas(
            whUnit? whUnit.width: 400,
            whUnit? whUnit.height: 300);
    // offScreenCanvas.width = '800';
    // offScreenCanvas.height = '600';

    // var context = offScreenCanvas.getContext("2d");
    // context.fillStyle = '#444'; //set fill color
    // context.fillRect(10, 10, 50, 50);
    return offScreenCanvas; //return canvas element
}


function copyToOnScreen(offScreenCanvas, onScreenCanvas, options={ transfer: true, clear: true }) {
    if(options.transfer === true) {
        const onScreenContext = onScreenCanvas.getContext('bitmaprenderer')
        let offScreenBitmap = offScreenCanvas.transferToImageBitmap()
        onScreenContext.transferFromImageBitmap(offScreenBitmap)
        return
    }

    const onScreenContext = onScreenCanvas.getContext('2d', {
        alpha: options.alpha !== false
    })

    onScreenContext.save()

    if(options.clear === true) {
        onScreenContext.clearRect(0, 0, onScreenCanvas.width, onScreenCanvas.height)
    }

    onScreenContext.globalCompositeOperation = options.compositeOperation || 'source-over'
    onScreenContext.drawImage(
        offScreenCanvas,
        0, 0, offScreenCanvas.width, offScreenCanvas.height,
        0, 0, onScreenCanvas.width, onScreenCanvas.height
    )

    onScreenContext.restore()
}


class StageOffscreenTools {

    constructor(point) {
        this.parent = point
    }

    create(size) {
        if(size == undefined) {
            size = this.parent.dimensions
        }
        return createOffscreenCanvas(size)
    }
}

console.log('offScreen')


Polypoint.head.deferredProp('Stage',
    function offscreen() {
        return new StageOffscreenTools(this)
    }
);
