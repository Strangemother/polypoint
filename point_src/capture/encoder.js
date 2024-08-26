
class Capture {
    framerate = 60
    format = 'gif'
    workersPath = './'

    constructor(stage) {
        this.stage = stage
    }

    start() {
        /*

        framerate          target framerate for the capture
        motionBlurFrames   supersampling of frames to create a motion-blurred
                            frame (0 or 1 make no effect)
        format             webm/gif/png/jpg/ffmpegserver
        quality            quality for webm/jpg
        name               name of the files to be exported.
                            if no name is provided, a GUID will be generated
        verbose            dumps info on the console
        display            adds a widget with capturing info (WIP)
        timeLimit          automatically stops and downloads when reaching
                            that time (seconds). Very convenient for long
                            captures: set it and forget it
                            (remember autoSaveTime!)
        autoSaveTime       it will automatically download the captured data
                            every n seconds (only available for webm/png/jpg)
        startTime          skip to that mark (seconds)
        workersPath        path to the gif worker script
         */
        const conf = {
                framerate: this.framerate
                , format: this.format
                , workersPath: this.workersPath
                , verbose: false
            }
        /*
        // Create a capturer that exports a WebM video
        var capturer = new CCapture( { format: 'webm' } );
        // Create a capturer that exports PNG images in a TAR file
        var capturer = new CCapture( { format: 'png' } );
        // Create a capturer that exports JPEG images in a TAR file
        var capturer = new CCapture( { format: 'jpg' } );
        */
        // Create a capturer that exports an animated GIF
        // Notices you have to specify the path to the gif.worker.js
        const capturer = new CCapture(conf);
        this.capturer = capturer

        this.stage.onDrawAfter(this.onDrawAfter.bind(this))
        capturer.start()
    }

    onDrawAfter(ctx) {
        console.log('Capture')
        // this.capturer.capture(ctx)
        this.capturer.capture(this.stage.canvas)
    }

    stop() {
        this.capturer.stop()
        this.stage.offDrawAfter(this.onDrawAfter.bind(this))
    }

    save() {
        this.capturer.save.apply(this.capturer, arguments)
    }


}

Polypoint.head.lazierProp('Stage',
    function capture() {
        return new Capture(this)
    }
);