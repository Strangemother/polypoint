
class Balloon {

    defaults = {
            gravity: -.31
            , ropePointLength: 20
            , segmentLength: 10
            , invMass: .2
            , color: '#990000'
            , knotColor: '#550000'
            , ropeColor: '#AAA'
            , radius: 60
            // , position: [1,1]
        }

    constructor(settings={}){

        Object.assign(this, this.defaults, settings)

        this.points = PointList.generate.random(10, [100, 200], [0,0, 5, 0])
        this.points.forEach((p)=>{
            p.update({vx: 0, vy:0 })
        })
        if(this.position) {
            this.mounted()
        }
    }

    mounted(initPos=this.position) {
        // this.ropePointLength = 20;
        // this.segmentLength = 10;
        // this.gravity = -.31;
        // this.gravity2D = gravity2D

        // let initPos = this.center.copy()
        this.points = this.ropePoints(initPos, this.ropePointLength * .5)
        this.points2 = this.ropePoints(initPos, this.ropePointLength)
        let penUlt = this.points[this.points.length - 3]
        // penUlt.invMass = 200
        let lastPoint = this.points.last()
        lastPoint.invMass = this.invMass
        lastPoint.radius = this.radius

        this.ropeReactor = new RopeReactor()
        this.visibleRopeReactor = new RopeReactor()

        this.points[0].copy(initPos.add(10,100))
        this.points2[0].copy(initPos.add(10,100))


        this.visibleRopeReactor.pin(0)
        this.ropeReactor.pin(0)
        this.visibleRopeReactor.pin(this.points2.length-1, this.points[this.points.length - 3])
        // this.visibleRopeReactor.pin(5)
    }

    ropePoints(initPos, ropePointLength){
        let points = Array.from({ length: ropePointLength }, () => ({
            x: initPos.x,
            y: initPos.y,
            oldX: initPos.x,
            oldY: initPos.y,
        }));
        // points[9].invMass = .01
        return new PointList(...points).cast()
    }

    get head() {
        return this.points.last()
    }

    get handle() {
        return this.points[0]
    }

    step(){
        /* A viscous fluid, applied through 2d invMass*/
        // this.applyPhysics2(this.points, this.gravity2D, [1, this.points.length-1]);
        let ropeReactor = this.ropeReactor
        let visibleRopeReactor = this.visibleRopeReactor
        /* Rope like mass physics.*/
        ropeReactor.applyPhysics(this.points, this.gravity);
        visibleRopeReactor.applyPhysics(this.points2, Math.abs(this.gravity)); // Gravity of rop is positive (pushing down)

        // ropeReactor.applyPhysics2(this.points, this.gravity2D)

        /* Different solving methods */
        // this.solveConstraints1(this.points, this.segmentLength);
        // this.solveConstraints2(this.points, this.segmentLength);
        ropeReactor.solveConstraints3(this.points, this.segmentLength * 3);
        visibleRopeReactor.solveConstraints3(this.points2, this.segmentLength);
    }

    draw(ctx) {
        // this.clear(ctx);
        this.points2[0].xy = this.points[0].xy

        this.step()

        // ctx.fillStyle = '#999'
        // ctx.font = 'normal 30px lexend deca'
        // ctx.textAlign = 'center'

        // this.points.pen.indicator(ctx);
        // this.points.pen.line(ctx, {color:'#444'});
        this.points2.pen.quadCurve(ctx, this.ropeColor);
        // this.points2.pen.line(ctx, {color:'#AAA'});

        let penUlt = this.points[this.points.length - 3]
        let last = this.points.last()
        this.points[0].pen.indicator(ctx)

        last.lookAt(penUlt)//, Math.PI *.5)
        // last.pen.indicator(ctx)

        // penUlt.pen.indicator(ctx)
        last.pen.fill(ctx, {'color': this.color})
        // last.pen.indicator(ctx, {color: '#770000'})
        penUlt.pen.fill(ctx, this.knotColor)
        // last.text.label(ctx, 'Polypoint')
    }

}
