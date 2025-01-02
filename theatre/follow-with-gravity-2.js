/*

src_dir: ../point_src/
files:
    ../point_src/core/head.js
    ../point_src/pointpen.js
    ../point_src/pointdraw.js
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/stage.js
    ../point_src/point.js
    ../point_src/distances.js
    ../point_src/pointlist.js
    ../point_src/events.js
    ../point_src/automouse.js
    ../point_src/functions/rel.js
    dragging
    ../point_src/constrain-distance.js

 */

// var gravity = {x: 0, y:-0.05}; // Gravity constant for helium balloon.
var gravity = {x: 0, y:0.95}; // Gravity constant

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        console.log('mounted')
        this.mouse.position.vy = this.mouse.position.vx = 0

        this.pins = (new PointList(
                  { x: 200, y: 100, vx: 0, vy: 0}
                , { x: 400, y: 100, vx: 0, vy: 0}
                , { x: 600, y: 100, vx: 0, vy: 0}
                , { x: 800, y: 100, vx: 0, vy: 0}

                , { x: 200, y: 400, vx: 0, vy: 0}
                , { x: 400, y: 400, vx: 0, vy: 0}
                , { x: 600, y: 400, vx: 0, vy: 0}
                , { x: 800, y: 400, vx: 0, vy: 0}
            )).cast()

        this.points = (new PointList(
                 { x: 300, y: 100, vx: 0, vy: 0}
                , { x: 500, y: 100, vx: 0, vy: 0}
                , { x: 700, y: 100, vx: 0, vy: 0}
                , { x: 900, y: 100, vx: 0, vy: 0}

                , { x: 300, y: 500, vx: 0, vy: 0}
                , { x: 500, y: 500, vx: 0, vy: 0}
                , { x: 700, y: 500, vx: 0, vy: 0}
                , { x: 900, y: 500, vx: 0, vy: 0}
            )).cast()

        this.dragging.add(...this.pins)
    }

    draw(ctx) {
        this.clear(ctx);

        let pins = this.pins
        let points = this.points

        let drawSet = function(index, func) {
            func(points[index], pins[index])

            pins[index].pen.circle(ctx, {color:'red'})
            points[index].pen.indicator(ctx)
        }

        let funcs = [
              // (p, pin) => springyString(p, pin)
            (p, pin) => pin.constraint.string(p, {
                            gravity,
                            damping: .98,
                            dotDamping: .2,
                            forceMultiplier: .9
                        })
            , (p, pin) => pin.constraint.string(p, {
                            gravity,
                            damping: .99
                        })
            , (p, pin) => pin.constraint.string(p, {
                            gravity,
                            damping: .98,
                            dotDamping: false,
                            forceMultiplier: .1
                        })
            , (p, pin) => pin.constraint.string(p, {
                            gravity,
                            damping: .99,
                            dotDamping: false
                        })
            , (p, pin) => pin.constraint.string(p, {
                            gravity
                            , dotDamping: 0
                            , damping: .98
                        })
            , (p, pin) => pin.constraint.string(p, {
                            distance: 200
                        })
            , (p, pin) => pin.constraint.string(p, {
                            forceMultiplier: 1
                            , distance: 200
                        })
        ]

        funcs.forEach((f, i)=> drawSet(i, f))

    }
}

const stage = MainStage.go()
