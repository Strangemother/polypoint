/*
title: Gradient
category: gradient
*/
class MainStage extends Stage {
    canvas='playspace'

    mounted(){
        // this.point = new Point(50, 50)


        const r = 200
        const shareSize = 15
        this.center.radius = r
        this.point0 = this.center.add(-r, 0)
        this.point1 = this.center.add(r, 0)
        this.point0.radius = this.point1.radius = shareSize
        this.point0.color = "hsl(299deg 62% 44%)"
        this.point1.color = "hsl(244deg 71% 56%)"

        this.grad = this.generateGrad(this.ctx, this.point0, this.point1)
    }

    draw(ctx){
        this.clear(ctx)
        this.center.pen.fill(ctx, this.grad)
        // this.center.pen.indicator(ctx, {color: '#fff', width: 1})
        this.point0.pen.line(ctx, this.point1, '#111111', 2)
        // this.point0.pen.line(ctx, this.point1, '#ffffff22', 2)
        this.point0.pen.fill(ctx)
        this.point1.pen.fill(ctx)
        this.point0.pen.circle(ctx, undefined, '#111', 4)
        this.point1.pen.circle(ctx, undefined, '#111', 4)
    }

    generateGrad(ctx, a, b) {
        let gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        // gradient.addColorStop(0,"#000000");
        gradient.addColorStop(0, a.color);
        // gradient.addColorStop(1,"red");
        gradient.addColorStop(1, b.color);
        return gradient
    }
}

;MainStage.go();