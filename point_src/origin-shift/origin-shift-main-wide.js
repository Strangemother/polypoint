const conf = originShiftConfigs.small({
    rows: 10
    , cols: 10
    , lineWidth: 20
    , lineColor: '#999'
    , originColor: 'white'
    // , lineCap: 'square'
})
// const conf = originShiftConfigs.maze()

// const conf = originShiftConfigs.small() // large()
let os = new OriginShift(conf);

const autoMain = function(){
    os.init() // run generate grid and any bits
    stage = MainStage.go({
        loop: false
    })
}


const addControls = function(){

        addButton('walk', {
             onclick(){
                console.log('click')
                stage.walk(stage.largeWalk, random.color());
            }
        });

        addButton('toe', {
             onclick(){
                console.log('click')
                stage.toe(random.color());
            }
        });

        addButton('rebake', {
            onclick(){
                os.rebake(stage);
            }
        })

        addButton('drawpath', {
            label: 'Draw Path'
            , onclick(){
                stage.drawPath(0, true);
            }
        })

        addControl('number type', {
            field: 'input'
            , value: 100
            , type: 'number'
            , onchange(ev) {
                let sval = ev.currentTarget.value
                stage.largeWalk = parseInt(sval)
            }
        })
}


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.reset()
        this.example()
        addControls()
        this.largeWalk = 100
    }

    shuffle(v=5) {
        os.pointList.each.x = (p) => p.x + random.int(-v, v);
        os.pointList.each.y = (p) => p.y + random.int(-v, v);
    }

    draw(ctx=this.ctx, addData={}){
        /* Without _clear_ the view will redraw on-top of the existing content */
        // , lineCap: 'square'
        ctx.lineCap = conf.lineCap || 'round'
        // ctx.lineCap = 'square'
        os.shift(addData.count || conf.drawStepCount, addData)
        this.clear(ctx)
        this.drawPoints(ctx)
        if(this.path) {
            // this.path.pen.fill(ctx, 'black', 3)
            this.path.pen.line(ctx, 'black', 4)
        }
    }

    drawPath(startIndex=0, clean=true, d={}){
        if(clean) {
            os.pointList.each.lineColor = undefined;
        }

        let path = new PointList()
        drawPath(startIndex, os, (p)=>{
            path.push(p)
        })

        this.path = path
        let addData = Object.assign({ count: 1 }, d)
        this.draw(this.ctx, addData)
    }

    example(){
        this.walk(this.largeWalk, 'purple');
        this.walk(10000);
        this.walk(this.largeWalk, 'orange');
        this.walk(10000);
        this.walk(this.largeWalk, 'green');
        this.walk(10000);
        this.walk(this.largeWalk, '#880000');
        this.walk(10000);
        os.rebake(this)

    }

    walk(count=1000, color=undefined) {
        os.shift(count, color? {color}: {})
        this.draw(this.ctx)
    }

    toe(color=undefined) {
        let ctx = this.ctx
        this.draw(ctx, {count: 1})
    }

    reset(draw=true){
        os.reset()
        draw && this.draw(this.ctx)
    }

    drawPoints(ctx, origin=os.origin) {
        let drawPos = conf.drawPosition
            , drawTip = conf.drawTip
            ;
        os.forEach((p, i, a) => {
            /* in cleanview, Do not render unvisited nodes */
            if(!p.hit || p.ignore) { return }
            this.drawPoint(ctx, p, i == origin, drawPos, drawTip, a)
        })

        this.drawOriginNode(ctx)
    }

    drawPoint(ctx, p, isOrigin, drawPos, drawTip, a) {
        // debugger
        let tip = p.target? a[p.target]: p.project() // to the radius
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
