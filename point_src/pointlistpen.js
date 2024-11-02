class PointListPen {

    constructor(pointList) {
        this.pointList = pointList;
    }

    points(ctx, cb) {
        let defaultF = (x)=>{
            // ctx.beginPath()
            x.draw.arc(ctx)
            // ctx.stroke()
        }
        if(cb == undefined) {
            cb = (x,f)=>f(x)
        }

        this.pointList.forEach((x)=>{
            cb(x, defaultF)
        })

    }

    line(ctx, d) {
        this.pointList.draw.line.apply(this.pointList.draw, arguments)
        ctx.stroke()
    }

    indicator() {
        return this.indicators.apply(this, arguments)
    }

    indicators(ctx, miniConf={}) {
        /* Synonymous to:

            randomPoints.draw.points(ctx, (item, arcDraw)=>{
                item.project().pen.line(ctx, item, 'red', 1)
                ctx.beginPath();
                arcDraw(item)
                quickStroke('orange', 1)
            })

        */

        let def = {
            line: {color:'red', width: 2}
            , circle: {color:'yellow', width: 1}
        };
        Object.assign(def, miniConf)

        let lc = def.color || def?.line?.color
        let lw = def.width || def?.line?.width
        let cc = def.color || def?.line?.color
        let cw = def.width || def?.circle?.width

        let eachPoint = (item, arcDrawF) =>{
                item.project().pen.line(ctx, item, lc, lw)
                ctx.beginPath();
                arcDrawF(item)
                quickStrokeWithCtx(ctx, cc, cw)
            }

        this.points(ctx, eachPoint)
    }

    fill(ctx, fillStyle, radius=undefined) {
        ctx.beginPath()
        let fs = fillStyle || this.color
        if(fs) {ctx.fillStyle = fs};

        this.points(ctx, (p)=> p.pen.fill(ctx, fs, radius))
        // this.point.draw.arc(ctx, radius)
        // ctx.lineWidth = width == undefined? 1: width

        ctx.fill()
    }

    stroke(ctx) {
        // ctx.stroke()
        let args = arguments;
        this.points(ctx, (p)=> p.pen.stroke.apply(p.pen, args))
    }

    circle(ctx, radius=undefined, color, width) {
        let args = arguments;
        this.points(ctx, (p)=> p.pen.circle.apply(p.pen, args))
        // return this.stroke.apply(this, arguments)
    }
}


Polypoint.head.install(PointListPen)
