
let rotationPoint = new Point(300, 300)

class Label {
    fontSize = 12
    fontWeight = 'normal'
    fontName = '"Courier New"'
    text = undefined
    textAlign = "left" // undefined // "center"
    textBaseline = "top" // undefined //"middle"
    position = undefined
    fillStyle = 'orange'
    /*Note. Applying this, overrides future get X()*/
    // letterSpacing =  undefined

    text = 'Sweet 90s Jazz.'
    _letterSpacing = undefined //'normal'

    constructor(ctx, text=undefined) {
        this.updateData(text)
        this.position = new Point(0, 0)
        this.ctx = ctx;
    }

    updateData(d) {
        if(typeof(d) == 'string'){
            this.text = d;
        }
        for(let k in d) {
            this[k] = d[k]
        }
    }

    get width() {
        return this.ctx.measureText(this.text).width
    }

    /* Anything that can be written to the canvas directly, has a draw method.
    */
    draw(ctx, conf) {
        let d = this.gather(ctx, conf)
        this.apply(ctx, d)
        this.write(ctx, d)
    }

    gather(ctx, conf={}) {
        let r = {
            fontSize: this.fontSize
            , fontWeight: this.fontWeight
            , fontName: this.fontName //|| '"Courier New"'
            , letterSpacing: this.letterSpacing || 'normal'
            , position: this.position
            , textAlign: this.textAlign
            , textBaseline: this.textBaseline
            , fillStyle: this.fillStyle || '#555'
            , fontSizeMeasurement: this.fontSizeMeasurement || 'px'
            , font: undefined
        }
        return Object.assign(r, conf)
    }

    apply(ctx, d) {
        ctx.font = d.font || `${d.fontWeight} ${d.fontSize}${d.fontSizeMeasurement} ${d.fontName}`;
        ctx.letterSpacing  = d.letterSpacing
        // ctx.letterSpacing  = `.335em`;
        ctx.fillStyle = d.fillStyle
        ctx.textAlign = d.textAlign
        ctx.textBaseline = d.textBaseline
    }

    write(ctx, d) {
        ctx.save();
        let p = d.position;
        // ctx.translate(300, 300)
        // ctx.rotate(degToRad(20))
        ctx.translate(p.x, p.y)
        ctx.rotate(p.radians)
        ctx.fillText(this.text, 0, 0)//p.x, p.y)
        ctx.restore();
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


    writeText(ctx, fillStyle){
        ctx = ctx || this.ctx
        let fontSize = this.fontSize
        ctx.font = `${this.fontWeight} ${fontSize}px ${this.fontName}`;

        if(fillStyle == undefined) {
            fillStyle = this.generateGrad()
        }

        ctx.letterSpacing  = this.letterSpacing || 'normal'
        // ctx.letterSpacing  = `.335em`;
        ctx.fillStyle = fillStyle
        let pos = this.position
        ctx.textAlign = this.textAlign
        ctx.textBaseline = this.textBaseline
        ctx.fillText(this.text, pos.x, pos.y)
    }

}


class MainStage extends Stage {
    canvas = 'playspace'
    rot = 0

    mounted(){
        let l = new Label(this.ctx, {
            text: 'Milkshake before breakfast.'
            // , fontSize: 12
            // , fillStyle: 'green'
        })
        l.position = new Point(100, 100)
        l.position.rotation = 0 // l.position.radians % Math.PI

        this.l = l

        // let t = new Text(ctx, 'Bananas')
        // t.position = new Point(100, 100)
        // t.writeText('red')
        let h = new Label(this.ctx, {
            fontSize: 50
            , textAlign: "center"
            , fontName: '"lexend deca"'
        })

        h.fillStyle = 'orange'
        h.position = new Point(300, 200)
        this.logo = h;
    }

    draw(ctx){

        this.clear(ctx)

        let p = new Point(300, 300)
        p.pen.circle(ctx)

        this.l.draw(ctx)
        this.l.position.pen.indicator(ctx, { color: 'orange'})


        let h = this.logo
        h.writeText(ctx)
        h.position.pen.indicator(ctx, { color: 'white'})
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


;stage = MainStage.go()