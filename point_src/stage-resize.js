
Polypoint.head.installFunctions('Stage', {
    /* Stage resize handling events.

    The stage naturally listens to the system resize event, with a debouncer.
    Upon resize, call `stickCanvasSize`, recaching the internal dimensions for
    relative meaurements.
    */

    resizeHandler(event) {
        /* Called by the global `resize` event listener when a resize occurs.
        Perform a debounced resize event.
        */
        if(!this.debounceResize) { return this.resize() }

        if(this.resizeTimer != undefined) { clearTimeout(this.resizeTimer) }
        this.resizeTimer = setTimeout(this.resize.bind(this), this.debounceResizeTimeout)
    }

    , resize() {
        /* Test the dimensions of the canvas and _stick_ the DOM width and height.
        Emit a resize event within the inner event framework containing
        the new cached dimesions
        */
        let dimensions = this.dimensions = this.stickCanvasSize(this.canvas)
        console.log('dimensions resize event')
        this.events && this.events.emit('resize', dimensions)
        return this.dimensions
    }

});


addEventListener('stage:prepare', (e)=>{
    /* Upon the event `stage:prepare`, create a listener to monitor
    the system resize event. Call the stage `resizeHandler` when an event
    occurs.
    */
    addEventListener('resize', function(e){
        this.stage.resizeHandler(e)
    }.bind({stage:e.detail.stage}));
});

