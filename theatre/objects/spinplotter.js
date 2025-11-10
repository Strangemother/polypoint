/*
title: Spinning Plot Object
*/

class SpinPlotter extends Point {

    created() {
        this.plotList = new PointList()

        let o = {
            slideSpeed: [2]
            , spinSpeed: 2
            , maxPlotCount: 200
            , plotModulo: 20
            , plotColor: '#ccc'
            , lineWidth: 1
            , sliceCount: 2
            , direction: 'sin'
            , periodOffset: 0
        }

        for(let k in o) {
            if(this[k] === undefined) {
                this[k] = o[k]
            }
        }

        this._ticker = 0
    }

    getNormValue() {
        /* return -1 0 1 for centroid scale of the spin. */
        let brushTipSin = this.getBrush()
        /* Define the axis to normalise. Math.PI*.5 is `sin` or y,
        because it's 1/4 PI, with the 0 degree on the horizontal line. */
        let axis = Math.PI * .5
        if(this.direction == 'cos') {
            // Check the horizontal.
            axis = 0
        }

        const sLR = signedNorm(brushTipSin, this, this.radius, axis, this.periodOffset);
        return sLR
    }


    getBrush() {

        if(this.brush !== undefined) {
            return this.brush
        }

        let tip = this.project()

        return {
            'sin': ()=> new Point(this.x, tip.y)
            , 'cos': ()=> new Point(tip.x, this.y)
            , 'both': ()=> tip
        }[this.direction]()

        // let brushTipSin = new Point(this.x, tip.y)
        // let brushTipCos = new Point(tip.x, this.y)
        // return brushTipSin
    }
    checkSlice() {
        let plotList = this.plotList
        if(plotList.length > this.maxPlotCount) {
            plotList = plotList.slice(this.sliceCount)
        }
        return plotList
    }

    render(ctx) {
        this.rotation += this.spinSpeed
        this._ticker++;

        // let plotList = this.plotList;
        let brushTipSin = this.getBrush()
        let plotList = this.updatePlot(this.plotList, brushTipSin)
        this.drawPrimaryPoint(ctx)
        this.drawPlotList(ctx, plotList)
        this.drawBrush(ctx, brushTipSin)

    }

    updatePlot(plotList=this.plotList, brushPoint=this.getBrush()) {
        if(this._ticker % this.plotModulo == 0) {
            plotList.push(brushPoint.copy())
        }

        this.plotList = plotList = this.checkSlice()

        // Fill plots
        plotList.forEach((p)=>{
            p.xy = p.add(this.slideSpeed)
        })

        return plotList
    }

    drawBrush(ctx, brushTipSin) {
        let plotColor = this.plotColor;
        brushTipSin.pen.fill(ctx, {color: plotColor})
    }

    drawPlotList(ctx, plotList){
        let plotColor = this.plotColor;
        // plotList.pen.line(ctx, {color: plotColor, width: this.lineWidth})
        // plotList.pen.indicator(ctx, {color: plotColor, width: this.lineWidth})
        plotList.pen.fill(ctx, undefined, 2)
        // plotList.pen.circle(ctx, {color: plotColor, width: this.lineWidth})
        plotList.pen.quadCurve(ctx, plotColor)
    }

    drawPrimaryPoint(ctx){
        // Draw plot, points, and brush.
        // this.pen.circle(ctx, {color: '#555'})
        this.pen.indicator(ctx, {color: '#555'})
    }
}
