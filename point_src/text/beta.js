/* A Simple Point Label - devoid of all the settings, in favour of pure rendering
(at a point and rotation).


    point.text.plain()
        point.text.writeText()
            point.text.write()
    point.text.fill()
        ctx.fillText

*/
class PointText {

    constructor(point) {
        this.point = point
        this.type = 'fill'
    }

    getText() {
        let p = this.point;
        return this.text
                || this.value
                || p.label
                || p.value
                || p.name
                || p.uuid
                ;
    }

    getOffset(){
        return this.offset || {x:0, y:0, radians: 0}
    }

    string(ctx, text=this.getText(), type=this.type){
        /* Write a simple string. No changes applied.

            x offset
            x rotation
            x styling
        */
       return this[type](ctx, text, this.point, true)
    }

    offsetString(ctx, words=this.getText(), offset=this.getOffset(), type=this.type) {
        /* Write a simple string. No changes applied.

            + offset
            x rotation
            x styling
        */
        return this[type](ctx, words, offset, false)
    }

    label(ctx, words=this.getText(), offset=this.getOffset(), type=this.type) {
        /*
            + offset
            + rotate
            x styling
        */
        ctx.save();

        let p = this.point;
        let r = p.radians
        r = r==undefined? 0:r

        let ofr = offset.radians
        ofr = ofr == undefined? 0: ofr

        ctx.translate(p.x, p.y)
        ctx.rotate(r + ofr)
        // ctx.fillText(words, offset.x, offset.y)
        this[type](ctx, words, offset, true)

        ctx.restore();
    }

    fill(ctx, words=this.getText(), offset={x:0,y:0}, abs=false) {
        let p = abs? {x:0, y:0}:this.point
        ctx.fillText(words, p.x + offset.x, p.y + offset.y)
        // this.contextCall(ctx, 'fillText', words, p.x + offset.x, p.y + offset.y)
    }

    stroke(ctx, words=this.getText(), offset={x:0,y:0}, abs=false) {
        let p = abs? {x:0, y:0}:this.point
        ctx.strokeText(words, p.x + offset.x, p.y + offset.y)
        // this.contextCall(ctx, 'strokeText', words, p.x + offset.x, p.y + offset.y)
    }

    // contextCall(ctx, method, words, x, y) {
    //     return ctx[method](words, x, y)
    // }

    plain(ctx, text=this.getText(), offset=this.getOffset()){
        /* Simply perform a write of text to the canvas. */
        this.writeText(ctx, text, offset)
    }

    writeText(ctx, words=this.getText(), offset=this.getOffset()){
        // ctx.font = `500 ${fontSize}px lexend deca`;
        // ctx.letterSpacing  = `${fontSize*.333}px`;
        // ctx.letterSpacing  = `.335em`;
        // ctx.fillStyle = fillStyle;
        let pos = this.point
        // ctx.fillText(words, pos.x, pos.y);
        this.write(ctx, pos, words, offset)
    }

    write(ctx, position, words=this.getText(), offset=this.getOffset()) {
        ctx.save();
        let p = position;
        let r = offset.radians
        ctx.translate(p.x, p.y)
        ctx.rotate(p.radians + (r==undefined? 0:r))
        ctx.fillText(words, offset.x, offset.y)
        ctx.restore();
    }

}

Polypoint.head.deferredProp('Point', function text() {
    return new PointText(this)
})