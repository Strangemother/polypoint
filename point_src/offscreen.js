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


function copyToOnScreen(offScreenCanvas, onScreenCanvas) {
    // const onScreenContext = document.getElementById("playspace").getContext("2d");
    const onScreenContext = onScreenCanvas.getContext("bitmaprenderer");
    // const onScreenContext = document.getElementById("playspace").getContext("bitmaprenderer");
    let offScreenBitmap = offScreenCanvas.transferToImageBitmap()
    onScreenContext.transferFromImageBitmap(offScreenBitmap);
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
