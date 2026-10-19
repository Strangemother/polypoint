
class StageViewport {
    constructor(stage) {
        this.stage = stage
    }

    doTracking = false
    doRotate = false
    doZoom = false

    track(ctx, target, others) {
        /* focus on the target by moving the others. */
        // get offset from center.
        let v = this.doTracking
        let t = target.xy
        let c = this.stage.center.xy
        v = [c.x - t.x, c.y - t.y]
        let s = 1 + (this.stage.mouse.wheelSize() * .1)

        if (this.doRotate) {
            this.viewport.rotateZoomTranslate(ctx, c, target, s)
        }

        if (this.doTracking) {
            // Shift the canvas to ensure the target is
            // at the center.
            if (!this.doRotate && this.doZoom) {
                this.viewport.zoomTranslate(ctx, c, s)
            }
            ctx.translate(...v);
        }
    }

    viewport = {

        rotateZoomTranslate(ctx, c, target, s=2) {
            // First we translate to the _center_
            ctx.translate(c.x, c.y);
            // spin opposite to the display direction
            ctx.rotate(-target.radians - (Math.PI * .5))
            ctx.scale(s, s)
            // Move the canvas back to its initial place (now rotated)
            ctx.translate(-c.x, -c.y);
        }

        , zoomTranslate(ctx, c, v) {
            ctx.translate(c.x, c.y);
            ctx.scale(v,v)
            ctx.translate(-c.x, -c.y);
        }

    }
    resetTransforms(ctx) {
            if (this.doTracking) {
                // reset any tranlate or rotate
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        }

}


Polypoint.extend.prop('Stage',
    function viewport() {
        return new StageViewport(this)
    }
);
