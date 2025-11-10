/*
title: Pairs And Siblings
files:
    head
    stage
    pointlist
    point
    mouse
    dragging
    ../point_src/extras.js
    ../point_src/math.js
    ../point_src/point-content.js
    ../point_src/events.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/setunset.js
    ../point_src/stroke.js
    ../point_src/split.js
    ../point_src/curve-extras.js
    ../point_src/protractor.js
    ../point_src/relative.js
    ../point_src/automouse.js
 */
class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        this.pointA = this.center.copy().update({ radius: 100})
        this.pointB = this.center.copy().update({radius: 100})
        this.pointA.x -= 150
        this.pointB.x += 150

        this.pointsA = this.pointA.split(20).pairs(0)
        this.pointsB = this.pointB.split(10).siblings(0)
        // this.points = this.point.split(4).pairs()

        this.dragging.add(this.pointA, this.pointB, this.pointsA, this.pointsB)
        this.pointsA.forEach( pl => this.dragging.add(...pl))
        this.pointsB.forEach( pl => this.dragging.add(...pl))
    }

    draw(ctx){
        this.clear(ctx)
        this.pointA.pen.indicator(ctx)
        this.pointB.pen.indicator(ctx)

        this.pointsA.forEach(pl=>{
            pl.pen.indicators(ctx)
            pl.pen.line(ctx)
        });

        this.pointsB.forEach(pl=>{
            pl.pen.indicators(ctx)
            pl.pen.line(ctx)
        })
        // this.points.pen.indicators(ctx)

    }
}



stage = MainStage.go()
