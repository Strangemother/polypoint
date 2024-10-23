

/* A Simple Point Label - devoid of all the settings, in favour of pure rendering
(at a point and rotation). */



class PointText {

    constructor(point) {
        this.point = point
    }

    getText() {
        return this.text || this.value || this.point.name || this.point.uuid
    }

    plain(ctx, text=this.getText(), offset=this.getOffset()){
        /* Simply perform a write of text to the canvas. */
        this.writeText(ctx, text, offset)
    }

    fill(ctx, words=this.getText(), offset={x:0,y:0}) {
        let p = this.point
        ctx.fillText(words, p.x + offset.x, p.y + offset.y)
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

    getOffset(){
        return this.offset || {x:0, y:0, radians: 0}
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