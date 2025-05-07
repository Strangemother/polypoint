/*
title: PNG Image
categories: images
    svg
files:
    ../point_src/math.js
    head
    ../point_src/point-content.js
    pointlist
    point
    mouse
    stage
    ../point_src/extras.js
    ../point_src/random.js
    ../point_src/distances.js
    ../point_src/functions/clamp.js
    ../point_src/dragging.js
    ../point_src/image.js
---

Another Image example.
*/

class MainStage extends Stage {
    canvas='playspace'
    live = true

    mounted(){
        this.image = new ImageLoader("../images/polypus.png")
        // ctx.putImageData(imageData, 100, 200);
        this.dragging.add(this.image.position)
    }

    draw(ctx){
        this.clear(ctx)
        let ip = this.image.position
        ip.rotation += 1
        ip.pen.circle(ctx, {color:'#3356FF'})
        this.image.draw(ctx)
    }
}


;stage = MainStage.go();