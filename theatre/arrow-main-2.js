var superV = 0


class MainStage extends Stage {
    canvas = 'playspace'

    mounted(){
        this.points = this.pointPair()

        this.linePoints = this.pointPair()
        this.curvePoints = this.pointPair(150)
        this.cantenaryPoints = this.pointPair(300)

         this.line = new Line(...this.linePoints, 'green', 2)
        /*this.line = new Line(...this.points, 'green', 2)*/
        this.curvyLine = new BezierCurve(...this.curvePoints)
        this.cantenary = this.setupCantenary(this.cantenaryPoints)
        /* this.cantenary = this.setupCantenary(this.pointPair(40)) */
        this.tick = 0

        this.setupDragging()
    }

    setupCantenary(points) {
        let c = new CantenaryCurve(...points)
        // this.cantenary.sine = 30
        c.restLength = 430
        c.bounceRate = .08
        c.reductionRate = .999
        c.swingDegrees = 20
        c.elasticity = .09
        return c

    }
    setupDragging() {

        this.dis = new Dragging
        this.dis.initDragging(this)
        // this.dis.onDragMove = this.onDragMove.bind(this)
        // this.dis.onDragEnd = this.onDragEnd.bind(this)
        this.dis.addPoints(  ...this.linePoints
                           , ...this.curvePoints
                           , ...this.cantenaryPoints
                           )
    }

    pointPair(yOffset=0) {
        let cumX = 0
            , cumOffset = 200
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        let ps = new PointList(
            new Point({
                name: "a"
                , rotation: c.right
                , x: offset()
                , y: globalY + yOffset
                , radius: 60
            })
            , new Point({
                name: "b"
                , rotation: c.left // RIGHT_DEG
                , x: offset()
                , y: globalY + 50 + yOffset
                , radius: 70
            })
        )

        return ps;
    }


    draw(ctx){
        this.clear(ctx)

        this.line.render(ctx)
        this.drawCantenary(ctx)
        this.curvyLine.points.pen.indicators(ctx, {line: {color: '#999', width: 1}})
        this.curvyLine.render(ctx, {width: 3, color: '#990088'})


        let p = this.dis.getPoint();
        if(p) {
            p.pen.circle(ctx)
        }

        this.tick += 1
    }

    drawCantenary(ctx) {

        let cantenary = this.cantenary;

        cantenary.render(ctx)

        let tick = this.tick
        if(tick % 1 == 0) {
            cantenary.update(ctx, tick)
            cantenary.updateSwing(ctx, tick)
        }
    }

}

stage = MainStage.go(/*{ loop: true }*/)
