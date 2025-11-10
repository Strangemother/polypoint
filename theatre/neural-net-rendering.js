/*
title: Neural Network Visualization
categories: arrange
files:
    head
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    stage
    point
    pointlist
    ../point_src/distances.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/random.js
    ../point_src/dragging.js
    stroke
    ../point_src/split.js
    ../point_src/relative.js
    ../point_src/automouse.js
    ../point_src/collisionbox.js
---

A quick example for generating a standard neural net.
*/
class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.toEdges = true
        this.stack = [
                3, 5, 3
            ]

        this.createNet()
    }

    createNet(stack=this.stack){
        let spreadY = 50
            , spreadX = 150
        let top = 100
            , left = 100

        let points = []
            , maxVal = Math.max.apply(Math, stack)
            ;

        for(let stackItem of stack) {
            let i = points.length
            let offset = ((maxVal * spreadY) - (spreadY * stackItem)) * .5

            let ps = PointList.generate.list(stackItem
                    , spreadY // distance between nodes in one column.
                    , [left + (spreadX * i), top + offset]
                );
            ps.each.radius = 19
            points.push(ps)
            this.dragging.add(...ps)
        }

        this.points = points;
    }

    draw(ctx) {
        this.clear(ctx);

        // ctx.fillStyle = '#DDD'
        ctx.font = '600 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        this.renderGraph(ctx)
    }

    renderGraph(ctx){
        // Iter each column
        let toEdges = this.toEdges
        this.points.forEach((ps, i, a)=>{
            // If the next column exists.
            // For each item in the column
            let lineColor = '#111154';
            ps.forEach((p,j)=>{

                if(a[i+1]) {
                    // Each item in the _next_ column_.
                    ctx.fillStyle = '#fff'
                    a[i+1].forEach((op, k)=>{
                        if(toEdges) {
                            let [front, back] = p.split(2)
                            let [tofront, toback] = op.split(2)
                            front.pen.line(ctx, toback, lineColor, 2)
                        } else {
                            p.pen.line(ctx, op, lineColor, 2)
                        }

                        let midPoint = p.lerp(op, .5)
                        let mpv = String(Math.random()).slice(0, 5);
                        midPoint.text.label(ctx, mpv)
                    })
                }
                // stage.points[2][2].text.string('12')
                // p.text.fill(ctx, "4")
            })

            // ps.pen.fill(ctx, '#080808');
            // ctx.fillStyle = '#999'

            ps.forEach((p,j)=>{
                // stage.points[2][2].text.string('12')
                let c = Math.random()

                if(Math.random() > .99) {
                    let sat = 20 + (c * 70)
                    p._sat = sat;
                    p.text.text = String(c).slice(0, 5);
                }
                let _sat = 40 // p._sat == undefined? 1: p._sat;
                let h = -100 + (250 * p.text.text)
                p.pen.fill(ctx, `hsl(${h}, ${_sat}%, 60%)`);
                // p.pen.fill(ctx, `hsl(${h}, ${_sat}%, 60%)`);
                // ps.pen.fill(ctx, '#080808');
                // ctx.fillStyle = '#999'
                ctx.fillStyle = '#000'
                p.text.label(ctx)
            })
            // ps.pen.circle(ctx, undefined, '#010101', 2);
        })
    }

}

stage = MainStage.go()
