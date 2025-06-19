/*
title: Emitter Curve
category: emitter
files:
    head
    ../point_src/math.js
    point
    ../point_src/point-content.js
    pointlist
    mouse
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/dragging.js
    stage
    stroke
    ../point_src/relative.js
    ../point_src/velocity.js
    ../point_src/emitter.js
    ../point_src/text/beta.js
    ../point_src/split.js
    ../point_src/curve-extras.js

---

*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.point = new Point(100, 100, 20)

        let lpoints = [new Point(200, 600, 400, 0)
                      , new Point(800, 200, 400, 180)
                      ]
        this.line = new BezierCurve(...lpoints)
        this.line.doTips = false;

        let le = new LineEmitter()
        this.lineEmitter = le

        let conf = {
            tickModulo: 1
            , baseRadius: 1
            , minSize: 1
            , maxSize: 4
            , radius: 1
            , lifetime: 180
            , birthrate: 4
            , baseSpeed: .1
            , radiusVariant: 3
            , lifetimeVariant: 1
            , direction: ()=> [random.float(-1, 1),0]
            // , direction: ()=> [random.choice([-1, 1]),0]
            // , direction: {x:1, y:0}
        }


        le.update(conf)

        le.cachePoints(this.line, .5)
        le.wake()

        this.dragging.add(...this.line.points)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
    }

    onDragEnd() {}
    onDragMove() {
        this.lineEmitter.cachePoints(this.line, .5)
    }

    draw(ctx){
        this.clear(ctx)

        ctx.strokStyle = '#EEE'
        ctx.fillStyle = '#EEE'
        ctx.font = `400 16px sans-serif`;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        this.lineEmitter.step()
        let pointColor = 'hsl(254deg 81% 66%)'
        let lineColor = 'hsl(269deg 82% 44%)'
        // pointColor = lineColor
        // let lineColor = 'hsl(299deg 62% 44%)' // light
        this.lineEmitter.points.pen.fill(ctx, pointColor)
        this.line.render(ctx, {color: lineColor, width: 3})

        ctx.fillStyle = '#EEE'

        this.line.points[0].text.fill(ctx
            , this.lineEmitter.points.length
            , {x:30, y:0}
        )
    }
}


stage = MainStage.go(/*{ loop: true }*/)

