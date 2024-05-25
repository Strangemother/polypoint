

class Anim {

    draw(canvas, draw, fps) {
        var f = draw;
        if( arguments.length == 1
            && typeof(canvas) == 'function' ) {
            f = canvas;
            canvas = undefined;
        };

        var cnv = this.create(canvas, f, fps);
        cnv.animFrame.loop()
        return cnv
    }

    calcWidth(canvas){

        var width = canvas.clientWidth * (window.devicePixelRatio);
        var height = canvas.clientHeight * (window.devicePixelRatio);
        canvas.width = width;
        canvas.height = height;
        return {
            width: width
            , height: height
        }
    }

    create(canvas, callback, fps) {
        /*
         run the method of execution on a canvas, wrapping the
         canvas with CottonDuck
         */
        var insp = this.inspectCanvas(canvas);
        insp.animFrame = new AnimFrame(insp.context, callback, fps);
        if(fps !== undefined) {
            insp.animFrame.forceFPS = true;
        }
        return insp;
    }

    inspectCanvas(canvas) {
        /* Inspect the canvas, returning DPR height an width, canvas and context.*/
        var cnv = this.getCanvas(canvas);
        var dpr = window.devicePixelRatio || 1;
        var ret = {
            context: undefined
            , canvas: cnv
            , width:  0
            , height: 0
            , devicePixelRatio: dpr
        };

        ret.context = cnv.getContext("2d");
        // debugger;
        ret.context.scale(dpr, dpr);
        // this.step.start(1000, context);

        var c = this.calcWidth( cnv)
        ret.width = c.width  * dpr;
        ret.height = c.height * dpr;
        return ret;
    }

    getCanvas(canvas){
        /*
         Return a canvas element, peoviding a string, ID or canvas item.
         IF one canvas exists this is returned.

         Order of preference:

            Canvas element
            Canvas Element ID
            Canvas Element 1 found
         */

        if( canvas === undefined ) {
            // find elements
            var els = document.getElementsByTagName('canvas');
            if(els.length == 1) {
                canvas = els[0];
            };
        } else {
            var canvasStr;

            if( typeof(canvas) == 'string' ){
                // by idl
                canvasStr = canvas;
                canvas = document.getElementById(canvasStr)
            } else if( canvas instanceof HTMLElement ) {
                // By element
            } else {
                return false
            }

        }

        if( (canvas instanceof HTMLElement) != true ) {
            throw new Error('Canvas:'  + canvas + ' must be HTML element')
        }

        return canvas;
    }
}


class AnimFrame {
    /* Wrap the requestAnimationFrame (xcompat) into a class */

    constructor(context, callback, fps){
        this.renderFunction = callback || function(){};
        this.run = true;
        this.forceFPS = false
        if(callback !== undefined) {
            this.renderFunction = callback;
        };


        this.fps =(1000 / (fps|| 60) )
        this.context = context

    }

    render(callback){
        /* Set or return the callback for the render function. Called
        by the frame() every X(fps) per second. */
        if(callback) { this.renderFunction = callback; };
        return this.renderFunction;
    };

    frame() {
        /* Called by the looper for one frame.
        Call the required rendering function */
        this.renderFunction(this.context)
    }

    getFramer(){
        /* Return the browser animation loop function (xcomat), setup with
        the correct FPS. The returned function shold be called as the
        frame function*/
        /* TODO:
        FPS is set in a strong manner. convert to aniticpating
        the conputation time.*/
        var f = window.requestAnimationFrame      ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, this.fps);
          };

        if(this.forceFPS == true) {
            return (function(f, fps){
                return function(v) {
                    window.setTimeout(function(){
                        f(v)
                    }, fps) }
            })(f, this.fps)
        }

        var browserAnimationFrame = (function(f, fps){
            return f
        })(f);

        return browserAnimationFrame;
    }

    loop() {
        this.createTime = +(new Date);
        var _loop = function(scope){
            var _s = scope;
            var browserAnimationFrame = _s.getFramer();
            (function animloop(){
                _s.run && browserAnimationFrame(animloop);
                _s.frame();
            })();
        };
        _loop(this);
    }

    start(){
        this.run = true;
        this.loop();
    }

    stop(){
        this.run = false;
    }

    running(){
        return this.run;
    }
}

