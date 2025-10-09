/*

title: Plotter
files:
    head
    point
    stage
    dragging
    pointlist
    mouse
    stroke
    fps
    ../point_src/functions/signedNorm.js
    ../theatre/objects/vectorpoint.js
    ../theatre/objects/spinplotter.js
---

Plotting captures the XY RAD ROT of a point upon request, and stashes it in a
pointlist. This is useful for timestep captures such as spline walks.

*/



class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){

        this.vectorPoint = new VectorPoint(100, 100, 50)
        let slideSpeed = [1,1];
        this.spinPlotter = new SpinPlotter({
            x: 200
            , y: 250
            , radius: 90
            , maxPlotCount: 50
            , slideSpeed
            , spinSpeed: 0
            , plotModulo: 5
            , plotColor: '#AA4400'
        })

        this.spinPlotter2 = new SpinPlotter({
            x: 450
            , y: 250
            , radius: 90
            , maxPlotCount: 50
            , rotation: 90
            , slideSpeed
            , spinSpeed: 2
            , plotModulo: 4
            , plotColor: '#880000'
        })

        this.spinPlotter3 = new SpinPlotter({
            x: 700
            , y: 250
            , radius: 90
            , maxPlotCount: 50
            , slideSpeed
            , plotModulo: 5
            , spinSpeed: 4
            // , direction: 'cos'
            , plotColor: '#AAAA88'
        })

        // this.spinPlotter.xy = this.spinPlotter2.xy = this.spinPlotter3.xy

        this.spinPlotter4 = new SpinPlotter({
            x: 950
            , y: 250
            , radius: 90
            , maxPlotCount: 200
            , slideSpeed
            , spinSpeed: 0
            , plotModulo: 2
            , lineWidth: 3
            , plotColor: '#AACC88'
        })

        let plotters = this.plotters = [
                this.spinPlotter
                , this.spinPlotter2
                , this.spinPlotter3
                , this.spinPlotter4
            ]

        this.spinPlotter4.brush = new Point(10, 20)

        let vcp = this.vectorPoint.addNewPoint(this.vectorPoint.copy().add(5,10))
        this.vectorPoint.onTipDragMove = ()=>{
            // console.log('onTipDragMove')
            let slideSpeed = (new Point(this.vectorPoint.getComputed())).multiply(-.01).xy

            this.plotters.forEach(p=>{
                p.slideSpeed = slideSpeed
            })
        }
        // this.vectorPoint.addNewPoint()
        this.dragging.add(
                ...plotters
                , this.vectorPoint
                , vcp
            )
    }


    draw(ctx){
        this.clear(ctx)
        this.fps.print(ctx)

        this.spinPlotter.render(ctx)
        this.spinPlotter2.render(ctx)
        this.spinPlotter3.render(ctx)

        // Create a point list 'wavw' addition function,
        let norm = (this.spinPlotter.getNormValue()
                    + this.spinPlotter2.getNormValue()
                    + this.spinPlotter3.getNormValue()) * .333

        let dist = this.spinPlotter4.radius * norm

        this.spinPlotter4.brush.x = this.spinPlotter4.x
        this.spinPlotter4.brush.y = this.spinPlotter4.y + dist

        this.spinPlotter4.render(ctx)
        this.vectorPoint.render(ctx)
    }
}

stage = MainStage.go()
