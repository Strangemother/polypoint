/*
title: a "Hole"
categories: hole
files:
    head
    point
    mouse
    stage
    dragging
    ../point_src/image.js
---

Cut a _hole_ through another vector.
In this example we have a _box_ and a _circle_.

Because the second entity (the `hole`) is drawn immediately after the first
entity (the `box`). The canvas pen _cuts_ through the previous drawing.

The polypus `image` is applied _before_ the overlay.
*/

class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.image = new ImageLoader("../images/polypus.png")

        this.box = this.center.copy().update({radius:200})
        this.hole = this.box.copy().update({radius: 100})
        this.image.position.xy = this.box.xy

        this.dragging.add(this.box, this.hole, this.image.position)
    }

    draw(ctx){
        this.clear(ctx)
        this.image.draw(ctx)
        ctx.fillStyle = '#544466'
        ctx.beginPath()
        this.box.draw.box(ctx)
        this.hole.draw.arc(ctx)
        ctx.fill()
    }
}


;stage = MainStage.go();