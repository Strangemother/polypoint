/*
    t = new Text(ctx, 'my text value')
    t.writeText(fillStyle [, ctx])
    t.text = 'new text value'
    t.writeText(fillStyle)
 */
class Text {
    fontSize = 12
    fontWeight = 'normal'
    fontName = 'lexend deca'
    text = undefined
    textAlign = "center"
    textBaseline = "middle"
    position = undefined
    /*Note. Applying this, overrides future get X()*/
    // letterSpacing =  undefined

    constructor(ctx, text=undefined) {
        if(text){
            this.text = text;
        }

        this.position = new Point(0, 0)
        this.ctx = ctx;
    }

    get width() {
        return this.ctx.measureText(this.text).width
    }

    writeText(fillStyle, ctx){
        ctx = ctx || this.ctx
        let fontSize = this.fontSize
        ctx.font = `${this.fontWeight} ${fontSize}px ${this.fontName}`;
        ctx.letterSpacing  = this.letterSpacing || 'normal'
        // ctx.letterSpacing  = `.335em`;
        ctx.fillStyle = fillStyle
        let pos = this.position
        ctx.textAlign = this.textAlign
        ctx.textBaseline = this.textBaseline
        ctx.fillText(this.text, pos.x, pos.y)
    }

}


