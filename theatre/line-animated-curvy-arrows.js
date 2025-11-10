/*
title: Line Animated Curvy Arrows
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/pointlist.js
    ../point_src/pointlistpen.js
    ../point_src/point.js
    ../point_src/stage.js
    ../others/curve_src/curve.js
    ../point_src/extras.js
    ../point_src/curve-extras.js
    ../point_src/iter/alpha.js
    ../point_src/setunset.js
    ../point_src/stroke.js

 */
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
        this.curvyLineA.points.pen.indicators(ctx, {color: '#444'})
        this.curvyLineA.render(ctx, { width: 2, color: '#8f08d5'})
        this.tick += 1
        riter.step(this.tick)
        // this.curvyLineA.b.rotation = rotiter.step(this.tick)
        rotiter.step(this.tick*.4)
        riter2.step(this.tick)
        yiter.step(this.tick*.5)
    }

}

stage = MainStage.go(/*{ loop: true }*/)
