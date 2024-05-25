
class Drawable {
    /* A layer to implement a render.*/
    #uuid = undefined

    constructor(data) {
        this.prepare(data)
    }

    prepare(data) {
        let opts = typeof(this.options) == 'function'? this.options(): this.options
        this.#uuid = Math.random().toString(32).slice(2,)
        this.data = Object.assign({}, (opts || {}), data)
    }

    // options(){
    //     return {}
    // }
    setup() {}

    render(ctx) {}
}


class Pen {
    /* Pen tools use the context to draw */

    colorStroke(color) {
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    equalTriangle(size) {
        let ctx = this.ctx;
        system.wrappers.beginClosePath(ctx, ()=> {
            ctx.moveTo(0, -size); // Top point
            ctx.lineTo(size, size); // Bottom right point
            ctx.lineTo(-size, size); // Bottom left point
        })
    }

    quadraticLine(points) {
        let ctx = this.ctx;
         // move to the first point
        ctx.moveTo(points[0].x, points[0].y);

        for(var i = 1; i < points.length - 2; i++){
            let xc = (points[i].x + points[i + 1].x) * .5;
            let yc = (points[i].y + points[i + 1].y) * .5;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        // curve through the last two points
        ctx.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x,points[i+1].y);

    }
}


class Tools extends Pen {
    /* Tools require the context wrapper */

    eqTriangle(cw, x, y, size, angle, color='red') {
        cw.saveRestore(cw.ctx, (ctx, cw)=>{
            // let ctx = ctxW.ctx;
            ctx.translate(x, y);
            // Adjust the rotation to align the forward direction
            ctx.rotate(angle + Math.PI / 2);

            cw.pen.equalTriangle(size)

            // ctx.lineWidth = 2
            // ctx.strokeStyle = 'white';
            // ctx.stroke();
            cw.pen.colorStroke(color)
        })
    }
}


class Wrappers {
    /* Wrapper functions accept callbacks to perform operations
    before and after the given function. */

    saveRestore(ctx, func) {
        // let ctx = this.ctx;
        ctx.save();
        func(ctx, this)
        ctx.restore();
    }

    beginClosePath(ctx, f) {
        // let ctx = this.ctx;
        ctx.beginPath();
        f(ctx, this)
        ctx.closePath();
    }

    lineWidth(ctx, lineWidth, f) {
        let prevL = ctx.lineWidth
        ctx.lineWidth = lineWidth
        f(ctx)
        ctx.lineWidth = prevL
    }


    colorStroke(ctx, color, f) {
        let prevL = ctx.strokeStyle
        ctx.strokeStyle = color;
        f(ctx)
        ctx.stroke();
        ctx.strokeStyle = prevL
    }
}


class ContextWrapper extends Wrappers {
    ctx = undefined
    tools = undefined
    pen = undefined
    wrappers = undefined
    layers = undefined

    constructor(ctx) {
        super()
        this.ctx = ctx;
    }
}


const point = function(x,y) {
    return new Point(x,y)
}

class Point {
    constructor(x,y){
        this[0] = this.x = x
        this[1] = this.y = y
    }
}

class LayeredDrawable extends Drawable {
    render(ctx) {
        this.tick += 1
        let childIterator = this.getChildren()
        let item = childIterator.next()
        let layer;
        let ctxWapper = this.contextWrapper;
        while(item.done == false) {
            layer = item.value;
            // console.log(layer)
            layer.render(ctxWapper)
            item = childIterator.next();
        }
    }

    * getChildren() {
        const layers = this.layers
        let index = 0
        let layer = layers[index]
        while(layer != undefined) {
            yield layer
            index++
            layer = layers[index]
        }
    }
}

class Layers extends Array {
    // constructor(a) {
    //     super(a)
    // }

    add(drawable) {
        drawable.setup()
        this.push(drawable)
    }
}


class Keys {
    down() {
        let bits = Array.from(arguments)
        let keys = bits.slice(0, bits.length-1)
        let func = bits[bits.length-1]
        console.log(keys, func)
        document.addEventListener('keydown', (e)=>{
            let code = e.key
            keys.forEach((k)=>{
                if(k == code) {
                    console.log('Listener', k)
                    func(e)
                }
            })
        })
    }
}

class System extends LayeredDrawable {
    /* Global Store of stuff. */
    tick = 0

    constructor() {
        super()
        this.tools = new Tools()
        this.pen = new Pen()
        this.wrappers = new Wrappers()
        this.layers = new Layers()
        this.keys = new Keys()
    }

    setScope(animInspection) {
        let ctx = animInspection.context
        this.contextWrapper = new ContextWrapper(ctx)

        this.tools.ctx = ctx
        this.pen.ctx = ctx
        this.wrappers.ctx = ctx

        this.contextWrapper.tools = this.tools
        this.contextWrapper.pen = this.pen
        this.contextWrapper.wrappers = this.wrappers

        this.scope = animInspection
    }

    run(mainCallback){
        let cnv = anim.create('canvas', this.mainCallback.bind(this))
        this.setScope(cnv)
        // cnv = anim.draw('canvas', mainCallback)
        cnv.animFrame.loop()
        // mainCallback(cnv)
    }

    mainCallback(ctx){
        // console.log(ctx)
        try {
            this.render(ctx)
        } catch(e) {
            console.error(e)
            console.warn('Forcing Stop.')
            this.scope.animFrame.stop()
        }
    }


}

