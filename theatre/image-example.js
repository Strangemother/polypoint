/*
title: Image PNG
categories: image
files:
    head
    point
    mouse
    stage
    dragging
    ../point_src/image.js
---

Load an image using the `ImageLoader`. The image has a `position`

    image = new ImageLoader("../images/polypus.png")
    image.position.xy = [400, 400]
    image.draw(ctx)

*/

class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.image = new ImageLoader("../images/polypus.png")
        this.dragging.add(this.image.position)
        this.image.position.xy = this.center.xy
    }

    draw(ctx){
        this.clear(ctx)
        this.image.draw(ctx)
    }
}


;stage = MainStage.go();