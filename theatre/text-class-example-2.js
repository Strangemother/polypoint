/*
title: TextAlpha Class
categories: text
files:
    head
    point
    pointlist
    stroke
    stage
    mouse
    dragging
    ../point_src/point-content.js
    ../point_src/text/alpha.js
    ../point_src/random.js
*/

class LogoText extends TextAlpha {
    text = 'POLYPOINT'
    fontSize = 120
    // fontName = "Noto Sans"
    fontWeight = 400
    generateGrad() {
        let pos = this.position
        let gradient = this.ctx.createLinearGradient(
                    pos.x,
                    pos.y,
                    pos.x + this.width,
                    pos.y + this.fontSize
                )
        gradient.addColorStop(0, "hsl(299deg 62% 44%)");
        gradient.addColorStop(1, "hsl(244deg 71% 56%)");
        return gradient
    }

    writeText(fillStyle=this.generateGrad(), ctx=this.ctx){
        ctx.fillStyle = fillStyle
        ctx.strokeStyle = fillStyle // 'hsl(244deg 12% 60%)'
        ctx.lineWidth = 1
        // ctx.lineCap = 'round'
        ctx.lineJoin = 'bevel'
        // ctx.lineJoin = 'round'
        this.configureCtx(ctx)
        let pos = this.position
        // ctx.fillText(this.text, pos.x, pos.y)

        ctx.fillText(this.text, pos.x, pos.y)
        // ctx.strokeText(this.text, pos.x, pos.y)
    }

}


class MainStage extends Stage {
    rot = 0
    canvas = 'playspace'

    mounted(){
        this.p1 = new Point(400, 200)
        let h = new LogoText(this.ctx)
        h.position = new Point(400, 200)
        this.logo = h;
    }

    draw(ctx){
        this.clear(ctx)
        let h = this.logo
        this.p1.draw.circle(ctx)
        let p = this.p1
        // ctx.fill()
        ctx.ellipse(p.x, p.y, 100, 100, 0, 0, Math.PI2, true)
        h.writeText()
    }
}


stage = MainStage.go(/*{ loop: true }*/)
