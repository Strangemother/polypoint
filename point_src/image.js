
const image = function(ctx, src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.addEventListener("load", () => {
        ctx.drawImage(img, 0, 0);
    });

    img.src = src;
}


class ImageLoader {
    /* Load an _image_ (such as png) into the point position with
    a given path:

        point = new Point(200,200)
        image = new ImageLoader("./images/mail.png", point)
        image.position.rotation = 30

        image.draw(ctx)

    The draw factors in the point radius, position, and rotation
    */
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
        // img.crossOrigin = 'anonymous';
        // img.src = path + '?' + new Date().getTime();
        // img.setAttribute('crossOrigin', '');
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
            // oSepia(ctx, this.imageData, stage.canvas)

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

        putImageData(ctx, imageData, 0, 0);
      };
    }

}



var oSepia = function(ctx, img, canvas) {
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        let red = data[i], green = data[i + 1], blue = data[i + 2];

        data[i] = Math.min(Math.round(0.393 * red + 0.769 * green + 0.189 * blue), 255);
        data[i + 1] = Math.min(Math.round(0.349 * red + 0.686 * green + 0.168 * blue), 255);
        data[i + 2] = Math.min(Math.round(0.272 * red + 0.534 * green + 0.131 * blue), 255);
    }
    ctx.putImageData(imageData, 0, 0);
}



const asImageData =  function(img) {
    /* A ctx.drawImage */
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageData
}

const putImageData =  function(ctx, imageData) {
    ctx.putImageData(imageData, 0, 0);
}

const imageDataEditor = function(ctx, img, func) {
    let imageData = asImageData(img)
    let data = imageData.data
    func(data)
    putImageData(ctx, imageData)
}

var sepia = function(data) {
    const round = Math.round;
    const min = Math.min;

    for (var i = 0; i < data.length; i += 4) {
        let red = data[i]
            , green = data[i + 1]
            , blue = data[i + 2]
            ;
        data[i] = min(round(0.393 * red + 0.769 * green + 0.189 * blue), 255);
        data[i + 1] = min(round(0.349 * red + 0.686 * green + 0.168 * blue), 255);
        data[i + 2] = min(round(0.272 * red + 0.534 * green + 0.131 * blue), 255);
    }
}

var invert = function(data) {
    for (var i = 0; i < data.length; i += 4) {
        data[i]     = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
    }
};

var grayscale = function(data) {
    for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i]     = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
};



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