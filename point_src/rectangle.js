/* Rectangle presentation tools for:

+ Pointlist pen tools
+ Point pen tools
+ Rectangle Top Class

## Pointlist tools

    pointlist.pen.rectangles(ctx, [width, height, rotation]) #per point
    pointlist.pen.squares(ctx, [width, rotation]) # per point

## Point Tools


    point.pen.rectangle(ctx, [width, height, rotation], rounded=true)
    point.pen.square(ctx, [width, rotation])


## Top Class

The top class `new Rectangle` is a _lesser_ pointlist, 2 points, or 4 points.
rectangle contains rectangle specific shaping and rendering

    r = new Rectangle(...points)
    r.rounded = true
    r.rotation = 30
    r.pen.fill(ctx)

Unlike a standard PointList or Point, top-level functions exist for rectangle rendering.

+ Rounded rect through point radii
+ Rect can be rotated
+ Has its own stroke and fill specific for rect
+ can anchor rotate
+ Draggable
+ rect bounding box



*/



// Polypoint.head.install(PointPenRectangle)

/*
Polypoint.head.lazyProp('Point', {
    pen() {
        let r = this._pen
        if(r == undefined) {
            r = new PointPenRectangle(this)
            this._pen = r
        }
        return r
    }
})
*/


Polypoint.head.installFunctions('PointPen', {
    rectangle(ctx, width, height, strokeWidth, offset, radii) {
        /*Draw and pen a primitive rectangle

                point.pen.rectangle(ctx, {})
        */
        let c = unpack(arguments, {
                height: this.point.radius
                , width: this.point.radius
                , strokeWidth: 3
                , radii: undefined
            })

        // rect(ctx, width=this.point.radius, height, color, strokeWidth, offset={x:0, y:0})
        let func = (c.radii != undefined)? this.roundRect: this.rect;
        return func.call(this, ctx, c.width, c.height, c.color, c.strokeWidth, c.offset, c.radii)
        // return this.rect(ctx, c.width, c.height, c.color, c.strokeWidth, c.offset)
    }
})


Polypoint.head.installFunctions('PointListPen', {
    rectangles(ctx, conf) {
        /*
            Draw and pen a primitive rectangle for each point

        */
        let eachPoint = (item) =>{
                item.pen.rectangle.apply(item.pen, arguments)
                ctx.beginPath();
                // quickStrokeWithCtx(ctx, tryInheritColor(item, cc), cw)
            }

        this.points(ctx, eachPoint)
    }
})

