class ImageLoader {

    constructor(path, point) {
        this.path = path
        this.width = undefined
        this.height = undefined
        this.position = point == undefined? new Point(100, 100, 100): point;
        this.scale = 1

        if(path != undefined) {
            this.load(path)
        }
    }

    load(path=this.path) {
        const img = new Image();
        img.addEventListener("load", () => { this.imageData = img });
        img.src = path;
        this.image = img
    }

    draw(ctx) {
        if(!this.imageData) { return };

        let p = this.position
              , radius = p.radius
              , r2 = radius * 2
              , scale = this.scale
              ;
          ctx.save()

          /* First we move to the location of which to spin.*/
          ctx.translate(p.x, p.y)
          /* Then spin the paper */
          ctx.scale(scale, scale)
          ctx.rotate(p.radians)
          /* then move to the position relative to the center of the image. */
          ctx.translate(-radius, -radius)

          /* Draw the image at position 0, 0
             of which is the rotated and translated position.*/
          ctx.drawImage(this.imageData, 0, 0, r2, r2)

          ctx.restore()
    }

    recolor() {
        var data = this.imageData
        // we manipulate the pixel data here in order to make the image lighter
        var changeColor = function() {
            for (var i = 0; i < data.length; i += 4) { // we are jumping every 4 values of RGBA for every pixel
              data[i]     = data[i] - 199;      // the red color channel - we have decreased its value
              data[i + 1] = data[i + 1] - 199;  // the green color channel - we have decreased its value
              data[i + 2] = data[i + 2] + 100;  // the blue color channel - we have increased its value
            }

        ctx.putImageData(imageData, 0, 0);
      };
    }

}

class PathData {
    constructor(pathData, point) {
        this.initRadius = 100
        this.position = point == undefined? new Point(100, 100, this.initRadius): point;
        let scale = this.scale = 4.4
        this.innerOffset = [-16, -14]
        this.offset = [-364, 0]
        this.lineWidth = 1
        this.strokeStyle = 'green'

        this.pathData = pathData
        this.path = new Path2D(pathData)
    }

    draw(ctx) {
        let p = this.path
        let offset = this.offset;
        let pos = this.position

        /* Rescaling needs a base value (init radius) to scale from.*/
        let innerScale = pos.radius / this.initRadius;
        let scale = this.scale * innerScale;

        ctx.save()

        ctx.strokeStyle = this.strokeStyle
        ctx.lineWidth = this.lineWidth / scale
        let innerOffset = [scale*this.innerOffset[0], scale*this.innerOffset[1]]
        ctx.translate(pos.x, pos.y)
        ctx.rotate(pos.radians)
        ctx.translate(offset[0]*scale + innerOffset[0], offset[1]*scale + innerOffset[1])
        ctx.scale(scale, scale)
        ctx.stroke(p)

        ctx.restore()
    }
}

let path = "M395.065.638c-.445-.068-2.723-.343-3.789.907a2.37,2.37,0,0,0-.344,2.4.49.49,0,0,1-.032.436,3.829,3.829,0,0,1-2.1,1.154c-.027.006-.046.024-.072.032a9.326,9.326,0,0,0-6.309-2.092,10.548,10.548,0,0,0-7.077,3.135l-8.115,8.115c-4,4-4.2,10.293-.457,14.036a9.252,9.252,0,0,0,6.6,2.679A10.55,10.55,0,0,0,380.8,28.3l8.114-8.114a10.061,10.061,0,0,0,1.32-13.018,4.693,4.693,0,0,0,2.4-1.8,2.482,2.482,0,0,0,.2-2.039c-.086-.268-.082-.441-.042-.488a3.093,3.093,0,0,1,1.968-.229,1,1,0,1,0,.3-1.977ZM382.486,5.469c.1,0,.2,0,.294,0a7.257,7.257,0,0,1,4.808,1.763l-3.531,3.531a1.473,1.473,0,0,0-1.685.235l-.976.975-4.281-4.281A8.508,8.508,0,0,1,382.486,5.469Zm-.53,8.84a.462.462,0,0,1-.634,0l-.11-.109a.45.45,0,0,1,0-.634l1.867-1.866a.46.46,0,0,1,.632,0l.111.111a.448.448,0,0,1,0,.633Zm-2.568,12.576c-3.218,3.217-8.247,3.419-11.209.457s-2.759-7.992.457-11.208l7.756-7.755,4.3,4.3-.184.184a1.451,1.451,0,0,0,0,2.048l.11.109h0a1.452,1.452,0,0,0,2.048,0l.183-.184,4.3,4.3Zm8.446-8.479-4.28-4.281.975-.975a1.442,1.442,0,0,0,.424-1.024,1.414,1.414,0,0,0-.185-.666l3.525-3.525A7.951,7.951,0,0,1,387.834,18.406Z"

class MainStage extends Stage {
    canvas='playspace'
    // live=false
    live = true
    mounted(){
        this.image = new ImageLoader("./images/mail.png")
        this.path = new PathData(path)
        this.dragging.add(this.image.position, this.path.position)
    }

    draw(ctx){
        this.clear(ctx)

        let ip = this.image.position
        ip.rotation += 1
        ip.pen.circle(ctx)
        this.image.draw(ctx)

        this.path.position.rotation += 2
        this.path.position.pen.circle(ctx)
        this.path.draw(ctx)

        let pos = this.mouse.position
        pos.pen.circle(ctx)
    }


}


;stage = MainStage.go();