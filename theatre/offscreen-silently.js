/*
title: Offscreen Silently
category: offscreen
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/offscreen.js
    mouse
    dragging
    stroke
---

Transfer the rendering to an offscreen canvas. 

In this example we use an offscreen canvas as the primary rendering unit, and the user doesn't handle anything.

    class Example extends Stage {
        mounted(){
            this.enableOffScreen()
        }
    }
*/


function presentOffscreenCanvas(offScreenCanvas, onScreenCanvas, opts={ transfer: true }) {
    if(offScreenCanvas == undefined || onScreenCanvas == undefined) {
        return
    }

    // try {
        return copyToOnScreen(offScreenCanvas, onScreenCanvas, opts)
    // } catch(error) {
        // let onScreenContext = onScreenCanvas.getContext('2d')
        // onScreenContext.clearRect(0, 0, onScreenCanvas.width, onScreenCanvas.height)
        // onScreenContext.drawImage(offScreenCanvas, 0, 0, onScreenCanvas.width, onScreenCanvas.height)
    // }
}


Polypoint.head.installFunctions('Stage', {
    enableOffScreen(options={}) {
        if(this._offscreenRendering?.enabled) {
            return this._offscreenRendering
        }

        let onScreenCanvas = options.canvas || this.canvas
        let offScreenCanvas = options.offScreenCanvas || this.offscreen.create(options.size)
        let contextType = options.contextType || '2d'

        const syncCanvasSize = ()=> {
            let dimensions = options.size || this.dimensions || {}
            let width = dimensions.width || onScreenCanvas.width || offScreenCanvas.width
            let height = dimensions.height || onScreenCanvas.height || offScreenCanvas.height

            if(width && offScreenCanvas.width != width) {
                offScreenCanvas.width = width
            }

            if(height && offScreenCanvas.height != height) {
                offScreenCanvas.height = height
            }
        }

        const present = ()=> presentOffscreenCanvas(offScreenCanvas, onScreenCanvas)

        syncCanvasSize()
        this._ctx = offScreenCanvas.getContext(contextType)

        if(this._offscreenSyncHook) {
            this.offDrawBefore(this._offscreenSyncHook)
        }

        if(this._offscreenPresentHook) {
            this.offDrawAfter(this._offscreenPresentHook)
        }

        this._offscreenSyncHook = syncCanvasSize
        this._offscreenPresentHook = present
        this._offscreenRendering = {
            enabled: true,
            canvas: offScreenCanvas,
            target: onScreenCanvas,
            present,
            syncCanvasSize
        }

        this.onDrawBefore(syncCanvasSize)
        this.onDrawAfter(present)

        return this._offscreenRendering
    }
})


class MainStageOffScreenSilently extends Stage {
    /* In this format we Install an "offscreen canvas" as the primary rendering unit.

    */
    canvas = 'playspace'

    mounted(){
        this.enableOffScreen()

        this.point = new Point(50, 50, 30)
        this.dragging.add(this.point)
    }

    draw(ctx){
        // this.clear(ctx)
        this.point.rotation += 1
        this.point.pen.indicator(ctx)
    }

}

stage = MainStageOffScreenSilently.go()
