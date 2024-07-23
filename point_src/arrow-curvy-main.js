class Iter {

    constructor(v=0, speed=.1, width=100, fixed=undefined, clamp=false) {
        this.origin = v
        this.value = v

        this.speed = speed
        this.width = width
        this.fixed = fixed
        this.clamp = clamp
    }

    tick(value) {
        this.origin = value
        this.step()
    }

    step(tick) {
        this.value = this.update(this.origin+tick)
        return this.value
    }

    update(value) {
        let v = value == undefined? this.origin: value;
        let swingSpeed = this.speed;
        let swingDegrees = this.width;
        let deltaSwing = Math.sin( (v * swingSpeed) % 360) * swingDegrees
        let r = this.origin + deltaSwing
        if(this.clamp && r < 0) {
            return 0
        }

        return this.fixed == undefined? r: Number(r.toFixed(this.fixed))
    }

    [Symbol.toPrimitive](hint){

        // return this.value;

        let o = {
            'number': ()=>this.value
            , 'string': ()=>this.value
            // Upon operator (+)
            , 'default': ()=>this.value
        }

        let f = o[hint]
        f = (f == undefined)? f=()=>this:f

        return f()
    }
}

var riter = new Iter(100, .02, 20)
var riter2 = new Iter(70, .03, 30)
var rotiter = new Iter(90, .04, 90)
var yiter = new Iter(250, .03, 150)

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'
    tick = 0
    mounted(){
        this.curvyLineA = new BezierCurve(...this.pointPair())
    }

    pointPair() {
        let cumX = 0
            , cumOffset = 200
            , globalY = 100
            , offset = ()=> cumX+=cumOffset
            , c = this.compass
            ;

        let ps = new PointList(
            new Point({
                name: "a"
                // , rotation: c.right + 45
                , modulusRotate: false
                , x: offset()
                , y: globalY
                , radius: riter
                , rotation: riter2
            })
            , new Point({
                name: "b"
                , modulusRotate: false
                // , modulusRotate: true
                , rotation: rotiter
                , x: offset()
                // , y: globalY + 50
                , y: yiter
                , radius: riter
            })
        )

        return ps;
    }

    draw(ctx){
        this.clear(ctx)
        this.curvyLineA.render(ctx)
        this.curvyLineA.points.pen.indicators(ctx)
        this.tick += 1
        riter.step(this.tick)
        // this.curvyLineA.b.rotation = rotiter.step(this.tick)
        rotiter.step(this.tick)
        riter2.step(this.tick)
        yiter.step(this.tick)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
