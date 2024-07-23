
const canvas = document.getElementById('playspace');
// const ctx = canvas.getContext('2d');
// Point.mouse.listen(canvas)

let stage;


const automain = function(){
    stage = new MainStage()
    stage.prepare(canvas)
    stage.loopDraw()

}

let rotationPoint = new Point(300, 300)


class Text {
    fontSize = 12
    position = new Point(0, 0)
    fontWeight = 'normal'
    fontName = 'lexend deca'
    text = undefined
    textAlign = "center"
    textBaseline = "middle"

    /*Note. Applying this, overrides future get X()*/
    // letterSpacing =  undefined

    constructor(ctx, text=undefined) {
        if(text){
            this.text = text;
        }

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


class HyperwayLogo extends Text {
    text = 'HYPERWAY'
    fontSize = 50
    _letterSpacing = undefined //'normal'

    constructor(ctx, t) {
        super(ctx, t)
    }

    set letterSpacing(v){
        this._letterSpacing = v
    }

    get letterSpacing() {

        if(this._letterSpacing == undefined) {
            return `${this.fontSize*.333}px`
        }

        return this._letterSpacing
    }

    generateGrad() {
        let pos = this.position
        let gradient = this.ctx.createLinearGradient(
                    pos.x,
                    pos.y,
                    pos.x + this.width,
                    pos.y + this.fontSize
                )

        gradient.addColorStop(0,"hsl(299deg 62% 44%)");
        gradient.addColorStop(1,"hsl(244deg 71% 56%)");
        return gradient
    }

    writeText(fillStyle, ctx){
        if(fillStyle == undefined) {
            fillStyle = this.generateGrad()
        }
        return super.writeText(fillStyle, ctx)
    }

}


class MainStage extends Stage {
    rot = 0

    mounted(){
        let h = new HyperwayLogo(this.ctx)
        h.position = new Point(0, 0)
        h.rotation = degToRad(10)
        // let t = new Text(ctx, 'Bananas')
        // t.position = new Point(100, 100)
        // t.writeText('red')
        this.logo = h;
    }

    draw(ctx){

        this.clear(ctx)
        let p = new Point(200, 200)
        p.pen.circle(ctx)
        let rot = this.rot++
        let h = this.logo
        ctx.save();

        // pos.pen.circle(ctx)
        ctx.translate(200, 300)
        // Spin the text to the desired rotation.
        ctx.rotate(h.rotation)
        // ctx.rotate(Math.PI/2 + (rot * .02))

        h.writeText()

        ctx.translate(10, 10)
        h.writeText()
        ctx.translate(10, 10)
        h.writeText()
        ctx.translate(10, 10)
        h.writeText()

        // Undo the translate and continue.
        ctx.restore();
    }

    generateGrad(ctx, pos, width, fontSize) {
        let gradient = ctx.createLinearGradient(pos.x, pos.y, width, fontSize)

        gradient.addColorStop(0,"hsl(299deg 62% 44%)");
        gradient.addColorStop(1,"hsl(244deg 71% 56%)");
        return gradient
    }

    writeText(ctx, words, pos, fontSize, fillStyle){
        ctx.font = `500 ${fontSize}px lexend deca`;
        ctx.letterSpacing  = `${fontSize*.333}px`;
        // ctx.letterSpacing  = `.335em`;
        ctx.fillStyle = fillStyle;
        ctx.fillText(words, pos.x, pos.y);
    }
}


;automain();
