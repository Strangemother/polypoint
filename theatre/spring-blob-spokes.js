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
    ../point_src/split.js
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
        , max: 60
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

        this.makeWheel()
        this.blobColor = 'green'
        this.braceColor = 'red'

        this.restLength = 40
        this.springConstant = .6
        this.dampingFactor = 0.92 // Adjust this value between 0 and 1

        this.collisionBox = new CollisionBox(this.points)
    }

    makeWheel() {
        this.spoked = new Point(200, 200, 100)
        this.spokes = this.spoked.split(20)
        this.spokes.update({
            vx: 0, vy: 0, mass: 2
        })
        this.spoked.update({
            vx: 0, vy: 0, mass: 20
        })

        this.dragging.addPoints(this.spoked)
        this.dragging.addPoints(...this.spokes)
    }

    drawWheel(ctx, lockedPoints) {
        const springConstant = this.springConstant
        const extra = 1
        let deltaTime = .5
        const rLen = this.restLength
        let axel = this.spoked
        let len = this.spokes.length
        this.spokes.forEach((p,i,l)=>{

            p.spring.to(axel
                , axel.radius * 1.4
                , 1
                , .1
                , lockedPoints
                , deltaTime
                )

            let next = l[i+1]
            if(next == undefined) {
                next = l[0]
            }

            if(next){
                p.spring.to(next
                    , (360 / len) * 2
                    , 1
                    , .09
                    , lockedPoints
                    , deltaTime
                )
            }

            let antipose = l[Math.floor(i + (len * .5)) % len]
            if(antipose != undefined) {
                // current, rLen, springConstant, damping, lockedPoints, deltaTime
                p.spring.to(antipose
                    , axel.radius * 4
                    , 1
                    , .001
                    , lockedPoints
                    , deltaTime
                )
            }

        })

        this.spoked.pen.circle(ctx, {color:'red'})
        this.spokes.pen.circle(ctx, {color: 'pink'})
        this.spokes.pen.quadCurve(ctx, {color: 'pink', loop: true})
    }

    onDragStart(ev, p) {
        this.dragPoint = p
    }

    onDragEnd(ev, p) {
        this.dragPoint = undefined
    }

    onWheel(ev, p) {
        if(p) {p.mass = p.radius}
    }

    draw(ctx){
        this.clear(ctx)
        let ps = this.points;
        let sv = this.dragPoint != undefined? [this.dragPoint]: [];
        const lockedPoints = new Set(sv)//ps[0]]); // Lock pointA in place

        this.drawWheel(ctx, lockedPoints)
    }
}

stage = MainStage.go(/*{ loop: true }*/)
