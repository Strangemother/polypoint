/*

files:
    ../point_src/point-content.js
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/pointlist.js
    ../point_src/point.js
    ../point_src/stage.js
    ../point_src/text/alpha.js



 */
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

class MainStage extends Stage {
    rot = 0
    draw(ctx){

        this.clear(ctx)
        let p = new Point(200, 200)
        p.pen.circle(ctx)
        let rot = this.rot++

        let fontSize = 50

        // The 'posisition' of the text. Notice its 0,0
        // as later we tranlate to a point. The tranlation _point_
        // performs a rotation around this origin.
        let pos = new Point(0, 0)
        let words = "HYPERWAY"

        let txtWidth = ctx.measureText(words).width;
        let fillStyle = this.generateGrad(ctx, pos, txtWidth, fontSize) // "#ff00ff"

        ctx.save();

        // The lef|Center|right anchor point of the text.
        ctx.textAlign="center";
        // Top|middle|bottom anchor of the text.
        // ctx.textBaseline="middle";
        ctx.textBaseline="middle";
        ctx.translate(rotationPoint.x, rotationPoint.y);

        // Draw the anchor of the text.
        // This is center center, due to the textBasline
        pos.pen.circle(ctx)

        // Spin the text to the desired rotation.
        ctx.rotate(Math.PI/2 + (rot * .02))

        // Render after the position manipulation.
        this.writeText(ctx, words, pos, fontSize, fillStyle)

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
