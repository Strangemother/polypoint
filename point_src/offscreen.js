/* Functions and utilities to assist with offscreen rendering */

function createOffscreenCanvas(onScreen) {
    // var offScreenCanvas = document.createElement('canvas');
    const offScreenCanvas = new OffscreenCanvas(onScreen? onScreen.width: 400, onScreen? onScreen.height: 300);
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


class PointIntersections {

    constructor(point) {
        this.parent = point

    }

}

Polypoint.head.deferredProp('Point',
    function intersections() {
        return new PointIntersections(this)
    }
);
