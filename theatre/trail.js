
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)
        this.textPos = new Point(100, 100, 20)

        let e1 = this.e1 = new TrailPointEmitter(400,400, 60)
        e1.wake()
        this.e1 = e1

        this.dragging.add(this.point, this.e1)
    }

    draw(ctx){
        this.clear(ctx)

        let e1 = this.e1
            , point = this.point
            , pointSpeed = point.speed2D
            , direction = pointSpeed.direction()
            , speedFloat = pointSpeed.absFloat()
            , props = [undefined, undefined, point]
            ;


        if(speedFloat > 0){
            props = [direction, speedFloat, point]
        }

        e1.step.apply(e1, props)

        e1.pen.indicator(ctx, '#aaa')
        e1.points.pen.indicator(ctx, undefined, '#aaa')
        // e1.pen.fill(ctx, '#aaa')
        // e1.points.pen.circle(ctx, undefined, '#aaa')

        point.pen.indicator(ctx, '#880000')

        ctx.fillStyle = 'white';
        ctx.font = `500 16px arial`;
        this.textPos.text.fill(ctx, speedFloat)
    }
}


stage = MainStage.go(/*{ loop: true }*/)

