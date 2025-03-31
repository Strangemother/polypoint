/*
category: text
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/text/alpha.js
    ../point_src/text/label.js
 */
let rotationPoint = new Point(300, 300)


class MainStage extends Stage {
    canvas = 'playspace'
    rot = 0

    mounted(){
        let l = new Label(this.ctx, {
            text: 'Milkshake before breakfast.'
            , fontSize: 16
            , fontName: 'barlow'
            // , fontName: 'Arial'
            // , fillStyle: 'green'
        })
        l.position = new Point(100, 100)
        l.position.rotation = 45 // l.position.radians % Math.PI

        this.l = l

        // let t = new Text(ctx, 'Bananas')
        // t.position = new Point(100, 100)
        // t.writeText('red')
        let h = new Label(this.ctx, {
            fontSize: 50
            , text: "Large eyebrows"
            , textAlign: "center"
            , fontName: '"lexend deca"'
        })

        h.fillStyle = 'orange'
        h.position = new Point(300, 300)
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