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
    ../point_src/text/beta.js
 */
let rotationPoint = new Point(300, 300)


class MainStage extends Stage {
    canvas = 'playspace'
    rot = 0

    mounted(){

        // let t = new TextAlpha(ctx, 'Bananas')
        // t.position = new Point(100, 100)
        // t.writeText('red')
        let h = new Label(this.ctx, {
            fontSize: 30
            , text: "Greek delta: \u03B4" // &#x03B4;
            // , textAlign: "center"
            , fontName: '"lexend deca"'
        })


        h.position = new Point(300, 300, 10, 30)
        this.textA = h;

        this.pointA = new Point(200, 300, 10, 20)
        this.pointB = new Point(230, 330, 10, 20)
    }

    draw(ctx){

        this.clear(ctx)

        let p = new Point(300, 300)
        // p.pen.circle(ctx)
        //&#10763;    &#x2A0B;
        this.pointA.text.plain(ctx, 'Summation with Integral: \u2A0B')

        // this.pointA.text.plain(ctx, '&#x2A0B;')
        let h = this.textA
        h.draw(ctx)
        h.writeText(ctx)
        h.position.pen.indicator(ctx, { color: 'white'})
    }

}


;stage = MainStage.go()