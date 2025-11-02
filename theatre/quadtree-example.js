/*
title: Linear Arrangement
categories: arrange
files:
    head
    stage
    point
    pointlist
    dragging
    stroke
    mouse
    ../point_src/random.js
    ../theatre/qt-rectangle.js
    ../theatre/qt-quadtree.js
*/
let boundary = new Rectangle(340, 340, 300, 300);
qtree = new QuadTree(boundary, 4);

class MainStage extends Stage {
    canvas = 'playspace'

    mounted() {
        this.reset()
    }

    reset() {
        this.points = PointList.generate.random(2000, 600, [100,100, 1])
        qtree.clear()
        this.points.forEach(p=>qtree.insert(p))
    }

    onMousedown(ev) {
        let p = Point.from(ev)
        qtree.insert(p);
        this.points.push(p)
    }

    draw(ctx) {
        this.clear(ctx);
        this.points.pen.circle(ctx, undefined, 'red')
        draw(ctx, this.mouse.point)
    }

}


function draw(ctx, mouse) {
    ctx.strokeStyle = 'orange'
    qtree.show(ctx);
    ctx.stroke()

    // rectMode(CENTER);

    let range = new Rectangle(mouse.x, mouse.y, 50, 50);
    let found = qtree.query(range);

    ctx.strokeStyle = 'green'
    let hw = range.w
    let hh = range.h
    ctx.rect(range.x - hw
            , range.y - hh
            , range.w * 2
            , range.h * 2)
    ctx.stroke()

    found.pen.circle(ctx, undefined, 'yellow')

}

stage = MainStage.go()
