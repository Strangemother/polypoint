
class PointPen {
    // Draw functions for the Point.draw
    // methods.
    constructor(point) {
        this.point = point;
    }

    _quickStroke(ctx, f, color, width=1, open=true, close=false) {
        open && ctx.beginPath()
        let r = f()

        let origStroke = ctx.strokeStyle
            , origWidth = ctx.lineWidth
            ;

        if(color != undefined) {
            ctx.strokeStyle = color == undefined? 'yellow': color
        }

        // if(width != undefined && ctx.lineWidth == undefined) {
        //     ctx.lineWidth = width == undefined? 1: width
        // }

        if(width != undefined) {
            ctx.lineWidth = width
        }

        close && ctx.closePath()

        ctx.stroke()
        ctx.strokeStyle = origStroke
        ctx.lineWidth = origWidth

        return r
    }

    ngon(ctx, sides, radius, fromCenter=true, color, width=1, angle=0, open=true, close=true) {
        return this._quickStroke(ctx, ()=>{
            let points = this.point.draw.ngon(ctx, sides, radius, fromCenter, angle)

        }, color, width, open, close)
    }

    circleGon(ctx, radius, lod=.3, fromCenter=true,color, width=1, open=true, close=true) {
        let sides = Number((radius * lod).toFixed())
        sides = Math.max(8, sides)
        return this.ngon(ctx, sides, radius, fromCenter, color, width, open, close)
    }

    line(ctx, otherPoint, color, width) {
        this._quickStroke(ctx, ()=>{
            if(otherPoint == undefined){
                otherPoint = this.point.project()
            }
            return this.point.draw.lineTo(ctx, otherPoint)
        }, color, width)
    }

    arc(ctx, otherPoint, color, distance=this.point.radius, width, direction=1) {
        // draw.arc(ctx, radius=undefined, start=0, end=Math.PI2, direction=1)
        this._quickStroke(ctx, ()=>{
            if(otherPoint == undefined){
                otherPoint = this.point.project()
            }
            let start = this.point.radians
            let end = otherPoint.radians
            this.point.draw.arc(ctx, distance, start, end, direction)

        }, color, width)
    }

    stroke(ctx, radius=undefined) {
        ctx.beginPath()
        this.point.draw.arc(ctx, radius)
        ctx.stroke()
    }

    circle(ctx, radius_or_conf=undefined, color, width) {
        /*An arc, but complete with begin path and stoking */

        let l = arguments.length
        let opts = {
            1: ()=>{
                //no conf
                this._quickStroke(ctx, ()=>{
                    this.point.draw.arc(ctx)
                })
            }
            , 2: ()=>{
                // ctx, dict
                const _color = radius_or_conf.color || ctx.strokeStyle
                const _width = radius_or_conf.width || ctx.lineWidth
                const _radius = radius_or_conf.radius || this.point.radius
                // quickStrokeWithCtx(ctx, _color, width)
                this._quickStroke(ctx, ()=>{
                    this.point.draw.arc(ctx, _radius)
                }, _color , _width)
            }
            , 3: ()=>{
                // ctx, width, color ...
                this._quickStroke(ctx, ()=>{
                    this.point.draw.arc(ctx, radius_or_conf)
                }, color , width)
            }
        }

        const extended = function(length) {
            return (length > 3) && opts[3]
        }
        let c = (opts[l]==undefined?extended(l):opts[l])()

        // this._quickStroke(ctx, ()=>{
        //     this.point.draw.arc(ctx, radius)
        // }, _color , _width)
    }

    fill(ctx, fillStyle, radius=undefined) {
        ctx.beginPath()

        this.point.draw.arc(ctx, radius)
        const getFillStyle = () => {
            if(fillStyle.color != undefined) {
                return fillStyle.color
            }

            if(fillStyle.fillStyle != undefined) {
                return fillStyle.fillStyle
            }

            return fillStyle
        };

        let fs = fillStyle == undefined? this.fillStyle || this.point.color: getFillStyle()

        ctx.fillStyle = fs
        // ctx.lineWidth = width == undefined? 1: width

        ctx.fill()
    }

    box(ctx, size=this.point.radius, color, width, angle){
        /*
            A box is a rectangle on the outside of radius.
            If an angle is given, the box cannot be a _rect_ and returns an ngon(4).

        */
        if(angle != undefined) {
            /* produce a ngon in the same location.*/
            return this.ngon(ctx, 4, size * 1.4, true, color, width, angle)
        }
        let offset = {x: -size, y: -size}
        return this.rect(ctx, size*2, undefined, color, width, offset)
    }

    rect(ctx, width=this.point.radius, height, color, strokeWidth, offset={x:0, y:0}) {
        let xy = this.point.xy
        if(height == undefined) {
            height = width
        }
        this._quickStroke(ctx, ()=>{
           ctx.rect(xy.x + offset.x, xy.y + offset.y, width, height)
           // this.point.draw.pen(ctx, width, height)
        }, color, strokeWidth)
    }

    indicator(ctx, miniConf={}) {
        /* Synonymous to:

            weightedComPoint.project().pen.line(ctx, weightedComPoint, 'red', 2)
            weightedComPoint.pen.circle(ctx, undefined, 'yellow', 1)

        */
        // let def = {
        //     line: {color:'red', width: 2}
        //     , circle: {color:'yellow', width: 1}
        // };

        // Object.assign(def, miniConf)

        let defaultCircleColor = '#66DD22'
        let defaultLineColor = defaultCircleColor
        let def = {
            line: {/*color:'red',*/ width: 2}
            , circle: {/*color:'yellow',*/ width: 1}
        };
        Object.assign(def, miniConf)

        let lc = def?.line?.color || def.color || defaultLineColor
        let lw = def?.line?.width || def.width
        let cc = def?.circle?.color || def?.color || def?.line?.color || defaultCircleColor
        let cw = def.width || def?.circle?.width

        this.point.project().pen.line(ctx, this.point, lc, lw,)
        this.circle(ctx, undefined,cc, cw,)
    }
}


Polypoint.head.install(PointPen)
/*
Polypoint.head.lazyProp('Point', {
    pen() {
        let r = this._pen
        if(r == undefined) {
            r = new PointPen(this)
            this._pen = r
        }
        return r
    }
})
*/


Polypoint.head.lazyProp('Point', {
    pen() { return new PointPen(this) }
}, 'pen')

