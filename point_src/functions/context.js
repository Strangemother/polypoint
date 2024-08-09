const saveRestoreDraw = function(ctx, position, callback) {
    /*
        + `save()` the context
        + translate and rotate to `position``
        + run the function
        + Restore.
     */
    ctx.save()

    let offsetX = -position.radius
        , offsetY = 0 // position.radius
    let tip = (new Point(offsetX, offsetY))

    ctx.translate(position.x, position.y) // Becomes the draw point.
    ctx.rotate(degToRad(position.rotation))// + this.tick))

    /* Draw tip */
    callback && callback(tip)
    // tip.draw.ngon(ctx, 3, position.radius)
    /* Pop the stack, de-rotating the page.*/
    ctx.translate(-position.x, -position.y) // Becomes the draw point.
    ctx.restore()

}