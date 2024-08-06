
class Line {
    constructor(p1, p2, color='red', width=1){
        // new Line([90, 130], [200, 300], 420)
        this.create.apply(this, arguments)
    }

    create(p1, p2, color='red', width=1) {
        this.a = point(p1)
        this.b = point(p2)
        this.color = color
        this.width = width
    }

    render(ctx) {
        this.start(ctx)
        this.draw(ctx)
        this.close(ctx)
    }

    start(ctx) {
        ctx.beginPath();
        let a = this.a;
        ctx.moveTo(a[0], a[1])
    }

    draw(ctx, color=undefined) {
        ctx.strokeStyle = color == undefined? this.color: color
        ctx.lineWidth = this.width == undefined? 1: this.width
        this.perform(ctx)

        ctx.stroke()
    }


    perform(ctx) {
        let b = this.b;
        ctx.lineTo(b[0], b[1])
    }

    close(ctx) {
        ctx.closePath()
    }
}

