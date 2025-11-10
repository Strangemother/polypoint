/*
title: Pointer Lock API Example
*/

/*
https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
 */

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.events.wake()
    }

    async onMousedown(ev) {
        /* assign lock.*/
        if(document.pointerLockElement) {
            return
        }

        try {
            await this.canvas.requestPointerLock({
                    unadjustedMovement: true,
            });
        } catch (error) {
            if (error.name === "NotSupportedError") {
                // Some platforms may not support unadjusted movement.
                await this.canvas.requestPointerLock();
            } else {
                throw error;
            }
        }

    }

    async onMousemove(ev) {
        if(!document.pointerLockElement){
            return
        }
            this.point.copy(this.point.add({x:ev.movementX, y:ev.movementY}))
    }

    async onMouseup(ev) {
        if(!document.pointerLockElement){
            return
        }

        // unlock
        document.exitPointerLock();
    }

    draw(ctx){
        this.clear(ctx)
        this.point.pen.fill(ctx, '#880000')
    }
}


stage = MainStage.go(/*{ loop: true }*/)

