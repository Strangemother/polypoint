/*
title: Touch Events
categories: touch
files:
    ../point_src/math.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/stage.js
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/stage-clock.js
    ../point_src/text/alpha.js
    ../point_src/text/fps.js
    ../point_src/functions/clamp.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/rotate.js
---

Detect finger touch events.
*/
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.touches = new Map
    }

    step() {

    }

    onTouchstart(ev){
        let touches = this.touches;
        ev.preventDefault()
        for(let touch of ev.touches) {
            let _id = touch.identifier
            if(touches.has(_id)){
                console.log('Existing touch')
                continue
            }
            let  yOffset = (touch.radiusX * 2) * 4

            let touchPoint = {
                color: colorForTouch(touch)
                , touch
                , yOffset
                , startPoint: new Point({
                    x: touch.pageX
                    , y: touch.pageY - yOffset
                    , radius: touch.radiusX
                    , radians: touch.rotationAngle
                })
                , movePoint: new Point({
                    x: touch.pageX
                    , y: touch.pageY - yOffset
                    , radius: touch.radiusX * touch.force
                    , radians: touch.rotationAngle
                })
            }
            console.log('start', _id)
            touches.set(_id, touchPoint)
            this.lastPoint = touchPoint
        }
    }

    onTouchend(ev){
        let local = this.touches;

        const touches = ev.changedTouches;
        for(let touch of touches) {
            let _id = touch.identifier
            console.log('end', _id)
            local.delete(_id)
        }
    }

    onTouchcancel(ev){
        console.log('onTouchcancel', ev)
    }

    onTouchmove(ev){
        // console.log('onTouchmove', ev)
        let touches = this.touches
        for(let touch of ev.touches) {
            let t = touches.get(touch.identifier)
            t.touch = touch
            t.movePoint.update({
                x: touch.pageX
                , y: touch.pageY  - t.yOffset
                , radius: touch.radiusX * touch.force
                , radians: touch.rotationAngle
            })
        }
    }

    draw(ctx){
        this.step()
        this.clear(ctx)
        this.touches.forEach((touch)=>{
            touch.startPoint.pen.indicator(ctx, {color:touch.color, width: 3})
            touch.movePoint.pen.indicator(ctx, {color:touch.color, width: 3})
        })
    }
}

function colorForTouch(touch) {
    let _id = 100 + (touch.identifier * 20)
    let r = _id % 16;
    let g = Math.floor(_id / 3) % 16;
    let b = Math.floor(_id / 7) % 16;
    r = r.toString(16); // make it a hex digit
    g = g.toString(16); // make it a hex digit
    b = b.toString(16); // make it a hex digit
    const color = `#${r}${g}${b}`;
    return color;
}

stage = MainStage.go()
