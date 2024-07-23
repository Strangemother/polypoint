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

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'
    tick = 0
    mounted(){
        let c = this.curvyLineA  = new BezierCurve(...this.pointPair())
        c.useCache = false;
    }

    pointPair() {
        let cumX = 0
            , cumOffset = 200
            , globalY = this.center.y
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
                , radius: 50
                , rotation: 10
            })
            , new Point({
                name: "b"
                , modulusRotate: false
                // , modulusRotate: true
                , rotation: 10
                , x: offset()
                , y: globalY + 50
                , radius: 50
            })
        )

        return ps;
    }

    draw(ctx){

        this.clear(ctx)

        let p = Point.mouse.position
        let l = this.curvyLineA
        let ps = l.points
        ps.rotate(.4)
        ps.lookAt(p)


        let currentDistance = l.a.distanceTo(l.b) * .5
        let distanceClamp = (q)=> clamp(q.distanceTo(p), 20, currentDistance)
        ps.keyMany('radius', distanceClamp)

        // ps.keyMany('radius', 10)
        // l.a.radius = l.a.distanceTo(p)
        // l.b.radius = l.b.distanceTo(p)

        ps.pen.indicators(ctx)
        l.width= 5
        l.color= '#00AA00'
        l.render(ctx)
        this.tick += 1


    }

}


const clamp = function(v, lower=undefined, upper=undefined) {
    let res = v;
    if(lower !== undefined && v < lower) {
        res = lower;
    }

    if(upper !== undefined && v > upper) {
        res = upper;
    }
    return res
}

stage = MainStage.go(/*{ loop: true }*/)
