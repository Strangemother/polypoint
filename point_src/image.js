
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
        img.addEventListener("load", (d) => {
            this.imageData = img
            // this.loaded(d)
        });
        img.src = path;
        this.image = img
    }

    setImageData(data) {
        // stage.offScreenCanvas.transferToImageBitmap()
        this.imageData = data
    }

    getOffscreenCanvas(width = 200, height = 300){
        let osc = new OffscreenCanvas(width, height)
        return osc
    }

    getImageData(osc, width = 200, height = 300) {
        let osctx = osc.getContext('2d')
        osctx.drawImage(this.image, 0, 0, width, height)
        let imageData = osctx.getImageData(0, 0, width, height)
        return imageData
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



const asImageData =  function(img, ctx) {
    /*
        createImageBitmap(asImageData(stage.image.image, stage.ctx)).then(b=>{
            stage.image.imageData = b;
        })
    */
    /* A ctx.drawImage */
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    return imageData
}

const putImageData =  function(ctx, imageData) {
    ctx.putImageData(imageData, 0, 0);
}

const imageDataEditor = function(ctx, img, func) {
    let imageData = asImageData(img, ctx)
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


var blur = function(data, width, height) {
    // Copy of original data so we don’t overwrite as we go
    var copy = new Uint8ClampedArray(data);

    for (var y = 1; y < height - 1; y++) {
        for (var x = 1; x < width - 1; x++) {
            var r = 0, g = 0, b = 0;
            for (var dy = -1; dy <= 1; dy++) {
                for (var dx = -1; dx <= 1; dx++) {
                    var i = ((y + dy) * width + (x + dx)) * 4;
                    r += copy[i];
                    g += copy[i + 1];
                    b += copy[i + 2];
                }
            }
            var i = (y * width + x) * 4;
            data[i]     = r * .11;
            data[i + 1] = g * .11;
            data[i + 2] = b * .11;
        }
    }
};


var blur2 = function(data, width, height, amount = 1) {
    var size = Math.max(3, (amount * 2 + 1) | 1); // ensures odd size: 3, 5, 7...
    var half = Math.floor(size / 2);
    var copy = new Uint8ClampedArray(data);
    var area = size * size;

    for (var y = half; y < height - half; y++) {
        for (var x = half; x < width - half; x++) {
            var r = 0, g = 0, b = 0;

            for (var dy = -half; dy <= half; dy++) {
                for (var dx = -half; dx <= half; dx++) {
                    var i = ((y + dy) * width + (x + dx)) * 4;
                    r += copy[i];
                    g += copy[i + 1];
                    b += copy[i + 2];
                }
            }

            var i = (y * width + x) * 4;
            data[i]     = r / area;
            data[i + 1] = g / area;
            data[i + 2] = b / area;
        }
    }
};


var blur3 = function(data, width, height, amount = 1) {
    var size = Math.max(3, (amount * 2 + 1) | 1); // odd grid: 3, 5, 7...
    var half = Math.floor(size / 2);
    var copy = new Uint8ClampedArray(data);
    var area = size * size;

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var r = 0, g = 0, b = 0, a = 0;
            var count = 0;

            for (var dy = -half; dy <= half; dy++) {
                for (var dx = -half; dx <= half; dx++) {
                    var px = Math.min(width - 1, Math.max(0, x + dx));
                    var py = Math.min(height - 1, Math.max(0, y + dy));
                    var i = (py * width + px) * 4;

                    r += copy[i];
                    g += copy[i + 1];
                    b += copy[i + 2];
                    a += copy[i + 3];
                    count++;
                }
            }

            var i = (y * width + x) * 4;
            data[i]     = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
            data[i + 3] = a / count;
        }
    }
};


function blurSeparable(data, width, height, amount = 1) {
    var size = Math.max(3, (amount * 2 + 1) | 1);
    var half = Math.floor(size / 2);
    var copy = new Uint8ClampedArray(data);
    var temp = new Uint8ClampedArray(data.length);

    // Horizontal pass
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var r = 0, g = 0, b = 0, a = 0, count = 0;

            for (var dx = -half; dx <= half; dx++) {
                var px = Math.min(width - 1, Math.max(0, x + dx));
                var i = (y * width + px) * 4;

                r += copy[i];
                g += copy[i + 1];
                b += copy[i + 2];
                a += copy[i + 3];
                count++;
            }

            var i = (y * width + x) * 4;
            temp[i]     = r / count;
            temp[i + 1] = g / count;
            temp[i + 2] = b / count;
            temp[i + 3] = a / count;
        }
    }

    // Vertical pass (on temp)
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var r = 0, g = 0, b = 0, a = 0, count = 0;

            for (var dy = -half; dy <= half; dy++) {
                var py = Math.min(height - 1, Math.max(0, y + dy));
                var i = (py * width + x) * 4;

                r += temp[i];
                g += temp[i + 1];
                b += temp[i + 2];
                a += temp[i + 3];
                count++;
            }

            var i = (y * width + x) * 4;
            data[i]     = r / count;
            data[i + 1] = g / count;
            data[i + 2] = b / count;
            data[i + 3] = a / count;
        }
    }
}


function gaussianBlur(imageData, amount = 1.0) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Kernel size: odd number based on amount
    const size = Math.max(3, Math.floor(amount * 3) | 1); // e.g. 1 → 3, 2 → 5, 3 → 7
    const sigma = amount;

    // Generate Gaussian kernel
    const kernel = generateGaussianKernel(size, sigma);

    // Apply convolution
    convolve(data, width, height, kernel, size);
}


function generateGaussianKernel(size, sigma) {
    const kernel = [];
    let sum = 0;
    const half = Math.floor(size / 2);

    for (let y = -half; y <= half; y++) {
        for (let x = -half; x <= half; x++) {
            const value = (1 / (2 * Math.PI * sigma * sigma)) *
                          Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
            kernel.push(value);
            sum += value;
        }
    }

    // Normalize
    return kernel.map(v => v / sum);
}


function convolve(data, width, height, kernel, kernelSize) {
    const output = new Uint8ClampedArray(data.length);
    const half = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0;
            let k = 0;

            for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {
                    const px = x + kx;
                    const py = y + ky;

                    if (px < 0 || px >= width || py < 0 || py >= height) {
                        k++;
                        continue;
                    }

                    const i = (py * width + px) * 4;
                    const weight = kernel[k++];

                    r += data[i]     * weight;
                    g += data[i + 1] * weight;
                    b += data[i + 2] * weight;
                }
            }

            const i = (y * width + x) * 4;
            output[i]     = r;
            output[i + 1] = g;
            output[i + 2] = b;
            output[i + 3] = data[i + 3]; // preserve alpha
        }
    }

    // Copy result back
    for (let i = 0; i < data.length; i++) {
        data[i] = output[i];
    }
}


function gaussianWeights(size, sigma) {
    const half = Math.floor(size / 2);
    const weights = [];
    let sum = 0;

    for (let i = -half; i <= half; i++) {
        const w = Math.exp(-(i * i) / (2 * sigma * sigma));
        weights.push(w);
        sum += w;
    }

    return weights.map(w => w / sum); // normalize
}


function blurSeparableGaussian(data, width, height, amount = 1.0) {
    const size = Math.max(3, (amount * 2 + 1) | 1);
    const half = Math.floor(size / 2);
    const sigma = amount;
    const weights = gaussianWeights(size, sigma);

    const copy = new Uint8ClampedArray(data);
    const temp = new Uint8ClampedArray(data.length);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;

            for (let dx = -half; dx <= half; dx++) {
                let px = Math.min(width - 1, Math.max(0, x + dx));
                let i = (y * width + px) * 4;
                let w = weights[dx + half];

                r += copy[i]     * w;
                g += copy[i + 1] * w;
                b += copy[i + 2] * w;
                a += copy[i + 3] * w;
            }

            let i = (y * width + x) * 4;
            temp[i]     = r;
            temp[i + 1] = g;
            temp[i + 2] = b;
            temp[i + 3] = a;
        }
    }

    // Vertical pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;

            for (let dy = -half; dy <= half; dy++) {
                let py = Math.min(height - 1, Math.max(0, y + dy));
                let i = (py * width + x) * 4;
                let w = weights[dy + half];

                r += temp[i]     * w;
                g += temp[i + 1] * w;
                b += temp[i + 2] * w;
                a += temp[i + 3] * w;
            }

            let i = (y * width + x) * 4;
            data[i]     = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = a;
        }
    }
}


function invertColors(data) {
  for (var i = 0; i < data.length; i+= 4) {
    data[i] = data[i] ^ 255; // Invert Red
    data[i+1] = data[i+1] ^ 255; // Invert Green
    data[i+2] = data[i+2] ^ 255; // Invert Blue
  }
}

// Gray = 0.21R + 0.72G + 0.07B // Luminosity
// Gray = (R + G + B) ÷ 3 // Average Brightness
// Gray = 0.299R + 0.587G + 0.114B // rec601 standard
// Gray = 0.2126R + 0.7152G + 0.0722B // ITU-R BT.709 standard
// Gray = 0.2627R + 0.6780G + 0.0593B // ITU-R BT.2100 standard

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