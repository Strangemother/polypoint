const conf = originShiftConfigs.large()
// const conf = originShiftConfigs.small() // large()
let os = new OriginShift(conf);

const autoMain = function(){
    os.init() // run generate grid and any bits
    stage = MainStage.go({
        loop: false
    })
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.reset()
        this.example()
    }

    draw(ctx=this.ctx, addData={}){
        /* Without _clear_ the view will redraw on-top of the existing content */
        os.shift(addData.count || conf.drawStepCount, addData)
        this.clear(ctx)
        this.drawPoints(ctx)
    }

    drawPath(startIndex=0, clean=true){
        if(clean) {
            os.pointList.each.lineColor = undefined;
        }
        drawPath(startIndex, os)

        this.draw()
    }

    example(){
        this.walk(100000, 'purple');
        this.walk(10000);
        this.walk(100000, 'orange');
        this.walk(10000);
        this.walk(100000, 'green');
        this.walk(10000);
        this.walk(100000, 'red');
        this.walk(10000);
        os.rebake(this)

    }
    walk(count=1000, color=undefined) {
        os.shift(count, color? {color}: {})
        this.draw(this.ctx)
    }
    reset(draw=true){
        os.reset()
        draw && this.draw(this.ctx)
    }

    drawPoints(ctx, origin=os.origin) {
        let drawPos = conf.drawPosition
            , drawTip = conf.drawTip
            ;
        os.forEach((p, i) => {
            /* in cleanview, Do not render unvisited nodes */
            if(!p.hit) { return }
            this.drawPoint(ctx, p, i == origin, drawPos, drawTip)
        })
        this.drawOriginNode(ctx)
    }

    drawPoint(ctx, p, isOrigin, drawPos, drawTip) {
        let tip = p.project() // to the radius
        this.drawDirectionLine(ctx, p, tip, isOrigin)
        drawPos && this.drawPosition(ctx, p, tip, isOrigin)
        !isOrigin && drawTip && this.drawTip(ctx, p, tip)
    }

    drawDirectionLine(ctx, p, tip, isOrigin){
        /* The origin has no direction - thus just ignore its line. */
        if(isOrigin) { return }
        let get = (k) => p[k] || conf[k]
        tip.pen.line(ctx, p, get('lineColor'), get('lineWidth'))
    }

    drawPosition(ctx, p, tip, isOrigin){
        p.pen.circle(ctx, 2, 'black', 3)
    }

    /* Draw the _tip_ of a projection. */
    drawTip(ctx, p, tip) {
        tip.pen.circle(ctx, conf.tipRadius, conf.tipColor, conf.tipWidth)
    }

    drawOriginNode(ctx) {
        os.getOrigin().pen.circle(ctx, 2, conf.originColor, conf.lineWidth)
    }

}


;autoMain();
