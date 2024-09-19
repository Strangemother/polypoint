

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

stage = MainStage.go(/*{ loop: true }*/)
