/*
title: Grid Flag
categories: minimal
    grid
files:
    ../point_src/unpack.js
    head
    point
    pointlist
    stage
    stroke
    dragging
    mouse
---

The minimal requirements include the _head_, _stage_, and the _point_.
*/


addSliderControlSet({
    color: { min: 0, max: 361, value: 190
        , onchange(ev, unit) {
            stage.baseColor = Number(ev.currentTarget.value)
            unit.value = ev.currentTarget.value

        }
    }
    , growth: { min: 0, max: 40, value: 6
        , onchange(ev, unit) {
            stage.growth = Number(ev.currentTarget.value)
            unit.value = ev.currentTarget.value

        }
    }
    , min: { min: .5, max: 40, value: 5, step: .5
        , onchange(ev, unit) {
            stage.min = Number(ev.currentTarget.value)
            unit.value = ev.currentTarget.value

        }
    }
})

class MainStage extends Stage {
    canvas = 'playspace'
    mounted() {
        this.point = this.center.copy().update({ radius: 30})
        // this.points = PointList.generate.grid(500, 20, 15, point(100, 100))
        this.points = PointList.generate.grid({
            count:500
            , rowCount:20
            , spread:15
            , position:point(100, 100)
        })

        this.tick = 0
        this.speed = .02
        this.phase = this.point.radians = .3
        this.growth = 6
        this.min = 3
        this.baseColor = 190
        this.dragging.add(this.point)
    }

    draw(ctx){
        this.clear(ctx)
        this.tick += 1
        this.phase = this.point.radians
        this.speed = this.point.radius * .001
        this.points.pen.fill(ctx)
        this.point.pen.indicator(ctx)
        let baseColor = this.baseColor
        this.points.each.radius = (p, i) => {
                    return this.min + (
                            Math.cos(i
                                * this.phase
                                + this.tick
                                * this.speed
                            )
                            * this.growth
                        )
                }

        this.points.each.color = (p,i)=>{
            return `hsl(${baseColor+Math.sin(i * this.speed * this.phase) * 40} 80% 50%)`
        }
    }
}


stage = MainStage.go(/*{ loop: true }*/)

