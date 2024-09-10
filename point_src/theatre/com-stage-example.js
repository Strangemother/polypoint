
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.rawPointConf = { circle: { color: 'orange', width: 1}}
        this.generate()
    }

    generate(pointCount=4){
        /* Generate a list. In this random... */
        this.randomPoints = PointList.generate.radius(pointCount, 100, point(200,200))
        /* Customise the points, randomising the mass and rotation. */
        this.randomPoints.forEach(p => {
                let mass = Math.random() * 10
                // p.mass = mass
                p.rotation = Math.random() * 360
                p.radius = Math.max(5, mass)
            })
        // this.dragging.add(...this.randomPoints)
        this.dragging.addPoints(...this.randomPoints)
        // this.dragging.onDragEnd = this.onDragEnd.bind(this)
        this.dragging.onDragMove = this.onDragMove.bind(this)
        this.dragging.onWheel = this.onWheel.bind(this)

        this.createMassPoints()
    }

    // onDragEnd(){
    //     this.createMassPoints()
    // }

    onDragMove(){
        this.createMassPoints()
    }

    onWheel(ev, p) {
        this.createMassPoints()
    }

    createMassPoints(){

        /* Call upon the list "center of mass" function */
        this.comPoint = this.randomPoints.centerOfMass()
        /* In this case we cater for mass and rotation additions */
        this.weightedComPoint = this.randomPoints.centerOfMass('deep')
    }

    draw(ctx){
        this.clear(ctx)
        this.drawView(ctx)
        let p = this.dragging.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }

    }

    drawView(ctx){
        /* Use the pen to draw a simple circle at the Center of Mass.*/
        this.comPoint.pen.circle(ctx, undefined, 'teal', 3)
        /* Draw an indicator at the _weighted_ Center of Mass. */
        this.weightedComPoint.pen.indicator(ctx)
        /* Draw a circle at the origin points */
        this.randomPoints.pen.indicators(ctx, this.rawPointConf)
    }
}

stage = MainStage.go()