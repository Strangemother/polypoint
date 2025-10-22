/*
categories: springs
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/math.js
    ../point_src/extras.js
    ../point_src/point-content.js
    ../point_src/pointlistpen.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/dragging.js
    ../point_src/stage.js
    ../point_src/stagepen.js
    ../point_src/automouse.js
    ../point_src/functions/springs.js
    ../point_src/functions/clamp.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/collisionbox.js


moved to functions/springs */

addButton('Add', {
    onclick() {
        let p = new Point({
             x: 280, y: 290
            , vx: 0, vy: 0
            , radius: 8
            , mass: 5
        })

        stage.points.push(p)

        // p.spring.to(ps.last(), rLen, springConstant, damping, lockedPoints, deltaTime)

    }
})


addSliderControlSet({
    restLength: {
        value: 1
        , min: 1
        , max: 200
        , onchange(ev, unit) {
            unit.value = stage.restLength = Number(ev.currentTarget.value);
        }
    }
    , springConstant: {
        value: .1
        , min: 0
        , max: 6
        , step: .1
        , onchange(ev, unit) {
            unit.value = stage.springConstant = Number(ev.currentTarget.value);
        }
    }
    , dampingFactor: {
        value: .01
        , min: 0
        , max: 1
        , step: .01
        , onchange(ev, unit) {
            unit.value = stage.dampingFactor = Number(ev.currentTarget.value);
        }
    }
})

addCheckbox('Show Braces', {
        checked: true
        , onchange(ev, unit){
            unit.value = stage.showBraces = ev.currentTarget.checked

        }
    })

addCheckbox('Show Points', {
        checked: true
        , onchange(ev, unit){
            unit.value = stage.showPoints = ev.currentTarget.checked

        }
    })


addCheckbox('Show Outer', {
        checked: true
        , onchange(ev, unit){
            unit.value = stage.showOuter = ev.currentTarget.checked

        }
    })

addCheckbox('Show Ball', {
        checked: true
        , onchange(ev, unit){
            unit.value = stage.showBall = ev.currentTarget.checked

        }
    })

addCheckbox('Fill Ball', {
        checked: false
        , onchange(ev, unit){
            unit.value = stage.fillBall = ev.currentTarget.checked

        }
    })


class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.points = new PointList(
            new Point({
                 x: 150, y: 230
                , radius: 4
                , vx: .1, vy: 0
                , mass: 5
            })
            , new Point({
                 x: 350, y: 200
                , vx: 2, vy: 0
                , radius: 4
                , mass: 5
            })
            , new Point({
                 x: 250, y: 270
                , vx: .4, vy: -1
                , radius: 4
                , mass: 5
            })
        )

        this.dragging.addPoints(...this.points)
        this.dragging.onWheel = this.onWheel.bind(this)
        this.dragging.onDragStart = this.onDragStart.bind(this)
        this.dragging.onDragEnd = this.onDragEnd.bind(this)

        this.showBraces = true
        this.showPoints = true
        this.showOuter = true
        this.fillBall = false
        this.showBall = false

        this.blobColor = 'green'
        this.braceColor = 'red'

        this.restLength = 200
        this.springConstant = 6
        this.dampingFactor = 0.92 // Adjust this value between 0 and 1

        this.collisionBox = new CollisionBox(this.points)
    }

    onDragStart(ev, p) {
        this.dragPoint = p
    }

    onDragEnd(ev, p) {
        this.dragPoint = undefined
    }

    onWheel(ev, p) {
        p.mass = p.radius
    }

    draw(ctx){
        this.clear(ctx)

        this.collisionBox.shuffle()
        let mouse = Point.mouse.position
        let ps = this.points;
        let sv = this.dragPoint != undefined? [this.dragPoint]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place
        lockedPoints.add(this.points[0])
        lockedPoints.add(this.points[2])
        const rLen = this.restLength
        const springConstant = this.springConstant
        const damping = this.dampingFactor
        const deltaTime = .2
        const extra = 2

        ps.spring.loop(rLen, springConstant, damping, lockedPoints, deltaTime)


        if(this.fillBall) {
            this.points.draw.quadCurve(ctx, true)
            this.pen.fill(ctx, {color: this.blobColor})
        }

        if(this.showBall) {
            this.points.pen.quadCurve(ctx, { loop: true, color: this.blobColor})
        }

        // cross braces.
        if(this.showBraces) {
            // this.points[0].pen.line(ctx, this.points[2], this.braceColor)
            // this.points[1].pen.line(ctx, this.points[3], this.braceColor)
        }

        this.showOuter && this.points.pen.line(ctx, {color: this.blobColor})
        this.showPoints && this.points.pen.fill(ctx, this.blobColor)
        this.showOuter && this.points[0].pen.line(ctx, this.points.last(), this.blobColor)

        this.points[1].pen.circle(ctx, 10, '#88CC33', 2)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
