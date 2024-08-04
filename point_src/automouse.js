/*

Automouse provides a point at the mouse position.
It's the _last known position_ of the mouse; updated upon mousemove.

HTML:

    <script src="point_src/automouse.js"></script>

JS:

    let point = Point.mouse.position

 */

const getLastMousePos = function(){
    return autoMouse.getMousePos(canvas)
}


class AutoMouse {

    constructor(parentClass) {
        this.parentClass = parentClass
        this.mouseCache = {x: 0, y: 0}
    }

    getMousePos(canvas) {
        var rect = this.getBoundingClientRect();
        let mouseCache = this.mouseCache
        return {
            x: mouseCache.x - rect.left,
            y: mouseCache.y - rect.top
        };
    }

    get xy() {
        return this.mouseCache
    }

    get position() {
        return new Point(this.mouseCache)
    }
    // [Symbol.toPrimitive](hint) {

    //     if (hint === 'string') {
    //         return this.toString()
    //     }
    //     return Reflect.apply(...arguments)
    // }

    getBoundingClientRect(canvas) {
        if(canvas === undefined) {
            canvas = this.canvas;
        }
        return canvas.getBoundingClientRect();
    }

    listen(canvas, eventName='mousemove') {
        this.canvas = canvas
        canvas.addEventListener(eventName, event => {
            let bound = this.getBoundingClientRect();
            let x = event.clientX - bound.left - canvas.clientLeft;
            let y = event.clientY - bound.top - canvas.clientTop;
            this.mouseCache = {x,y}
        });
        return this;
    }

}


const autoMouse = (new AutoMouse(Point))
Point.mouse = autoMouse
Point.pointArray = pointArray
