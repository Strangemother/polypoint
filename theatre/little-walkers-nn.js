/*
title: Poly Bugs!
files:
    head
    point
    pointlist
    stage
    mouse
    dragging
    stroke
    ../point_src/random.js
    ../point_src/relative.js
    ../point_src/screenwrap.js
    ../point_src/iter/lerp.js
    ../point_src/smooth-number.js

---

Little walking points.

*/

class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize, learningRate=0.03) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        this.weightsInputToHidden = Array.from({ length: hiddenSize }, () =>
            Array.from({ length: inputSize }, () => Math.random() * 2 - 1)
        );
        this.biasHidden = Array(hiddenSize).fill(0);
        this.weightsHiddenToOutput = Array.from({ length: outputSize }, () =>
            Array.from({ length: hiddenSize }, () => Math.random() * 2 - 1)
        );
        this.biasOutput = Array(outputSize).fill(0);
        this.learningRate = learningRate; // Adjusted learning rate
        this.hiddenLayer = new Array(this.hiddenSize);
    }

    feedForward(inputs) {
        for (let i = 0; i < this.hiddenSize; i++) {
            this.hiddenLayer[i] = 0;
            for (let j = 0; j < this.inputSize; j++) {
                this.hiddenLayer[i] +=
                    this.weightsInputToHidden[i][j] * inputs[j];
            }
            this.hiddenLayer[i] += this.biasHidden[i];
            this.hiddenLayer[i] = sigmoid(this.hiddenLayer[i]);
        }

        const output = new Array(this.outputSize);
        for (let i = 0; i < this.outputSize; i++) {
            output[i] = 0;
            for (let j = 0; j < this.hiddenSize; j++) {
                output[i] +=
                    this.weightsHiddenToOutput[i][j] * this.hiddenLayer[j];
            }
            output[i] += this.biasOutput[i];
            output[i] = sigmoid(output[i]);
        }
        return output;
    }

    trainOne(inputs, target) {
        for (let i = 0; i < this.hiddenSize; i++) {
            this.hiddenLayer[i] = 0;
            for (let j = 0; j < this.inputSize; j++) {
                this.hiddenLayer[i] +=
                    this.weightsInputToHidden[i][j] * inputs[j];
            }
            this.hiddenLayer[i] += this.biasHidden[i];
            this.hiddenLayer[i] = sigmoid(this.hiddenLayer[i]);
        }

        const output = new Array(this.outputSize);
        for (let i = 0; i < this.outputSize; i++) {
            output[i] = 0;
            for (let j = 0; j < this.hiddenSize; j++) {
                output[i] +=
                    this.weightsHiddenToOutput[i][j] * this.hiddenLayer[j];
            }
            output[i] += this.biasOutput[i];
            output[i] = sigmoid(output[i]);
        }

        const errorsOutput = new Array(this.outputSize);
        const errorsHidden = new Array(this.hiddenSize);

        for (let i = 0; i < this.outputSize; i++) {
            errorsOutput[i] = target[i] - output[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsHiddenToOutput[i][j] +=
                    this.learningRate *
                    errorsOutput[i] *
                    output[i] *
                    (1 - output[i]) *
                    this.hiddenLayer[j];
            }
            this.biasOutput[i] += this.learningRate * errorsOutput[i];
        }

        for (let i = 0; i < this.hiddenSize; i++) {
            errorsHidden[i] = 0;
            for (let j = 0; j < this.outputSize; j++) {
                errorsHidden[i] +=
                    this.weightsHiddenToOutput[j][i] * errorsOutput[j];
            }
            this.biasHidden[i] += this.learningRate * errorsHidden[i];
            for (let j = 0; j < this.inputSize; j++) {
                this.weightsInputToHidden[i][j] +=
                    this.learningRate *
                    errorsHidden[i] *
                    this.hiddenLayer[i] *
                    (1 - this.hiddenLayer[i]) *
                    inputs[j];
            }
        }
    }

    train(count=30000) {
        let trainingData = this.trainingData
        for (let i = 0; i < parseInt(count); i++) {
            const data =
                trainingData[Math.floor(Math.random() * trainingData.length)];
            this.trainOne([data.x, data.y], this.encodeOne(data.label));
        }
        
        console.log("Training complete");
    }
}


class Classifier extends NeuralNetwork {
    /* Simple classifier. 
        in -> values
        out -> classification. 
    */
    constructor(inputSize, hiddenSize, outputSize, learningRate=0.03) {
        super(inputSize, hiddenSize, outputSize, learningRate=0.03)
        this.trainingData = this.createTrainingData()
    }


    createTrainingData() {
        const trainingData = [];
        const numDataPoints = 1000; // Adjust the number of data points as needed

        for (let i = 0; i < numDataPoints; i++) {
            const x = Math.random() * 2 - 1; // Random x value between -1 and 1
            const y = Math.random() * 2 - 1; // Random y value between -1 and 1

            let label;
            if (x <= 0 && y < 0) {
                label = "blue";
            } else if (x <= 0 && y > 0) {
                label = "green";
            } else if (x > 0 && y <= 0) {
                label = "red";
            } else {
                label = "purple";
            }

            trainingData.push({ x, y, label });
        }

        return trainingData
    }

    classifications(){
        const encoding = {
            blue: [1, 0, 0, 0],
            red: [0, 1, 0, 0],
            green: [0, 0, 1, 0],
            purple: [0, 0, 0, 1]
        };

        return encoding
    }

    predict() {
       
        let points = [];
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 2 - 1; // Random x-coordinate between -1 and 1
            const y = Math.random() * 2 - 1; // Random y-coordinate between -1 and 1
            const output = this.feedForward([x, y]);
            const predictedLabel = this.decodeOne(output);
            points.push({ x, y, predictedLabel });
        }
        console.log(points);
        console.log(this.hiddenLayer);
        return [points, this.hiddenLayer]
    }

    ask(...v) {
        return this.decodeOne(this.feedForward(v));
    }

    encodeOne(label) {
        const encoding = this.classifications()
        return encoding[label];
    }

    decodeOne(output) {
        const labels = Object.keys(this.classifications())
        const maxIndex = output.indexOf(Math.max(...output));
        return labels[maxIndex];
    }

} 

// var hiddenNodes = parseInt(6);
// neuralNetwork = new NeuralNetwork(2, hiddenNodes, 4);

neuralNetwork = new Classifier(2, 6, 4);


function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}



const walkTime = 10

class AutoLerpPoint extends Point {

    tick = 0

    xSet(value) {
        // console.log('set x')
        if(this.newX == undefined) {
            this.newX = new Value(value, value, undefined, true)
        }

        this.startDateX = +(new Date)
        this.endDateX = this.startDateX + walkTime // 1 second

        this.tickX = 0
        let old = this._opts['x']
        this.newX.a = old
        this.newX.b = value
        this.newX.step = 0
        return old
    }

    rotationSet(value) {
        // console.log('set x')
        if(this.newR == undefined) {
            this.newR = new Value(value, value, undefined, true)
        }

        this.startDateRotation = +(new Date)
        this.endDateRotation = this.startDateRotation + walkTime // 1 second

        this.tickRotation = 0
        let old = this._opts['rotation']
        this.newR.a = old
        this.newR.b = value
        this.newR.step = 0
        return old
    }

    onScreenWrapChange(x, y) {
        if(y !== undefined){
            this.newY.a = this.newY.b = y
            this.newY.step = 1
        }
        if(x !== undefined) {
            this.newX.a = this.newX.b = x
            this.newX.step = 1
        }

    }

    ySet(value) {
        // console.log('set y')
        if(this.newY == undefined) {
            this.newY = new Value(value, value, undefined, true)
        }

        this.startDateY = +(new Date)
        this.endDateY = this.startDateY + walkTime // 1 second

        this.tickY = 0
        let old = this._opts['y']
        this.newY.a = old
        this.newY.b = value
        this.newY.step = 0
        return old
    }

    currentSlide(k) {
        if(k == 'x') {
            let width = this.endDateX - this.startDateX
            let slide = 1 - ( this.endDateX - (this.startDateX + this.tickX) )  / width
            return slide;
        }

        if(k == 'y') {
            let width = this.endDateY - this.startDateY
            let slide = 1 - ( this.endDateY - (this.startDateY + this.tickY) )  / width
            return slide;
        }

        if(k == 'rotation') {
            let width = this.endDateRotation - this.startDateRotation
            let slide = 1 - ( this.endDateRotation - (this.startDateRotation + this.tickRotation) )  / width
            return slide;
        }
    }

    step() {
        // let slide = this.currentSlide()
        // console.log(slide)
        this.tick++

        this.tickX++
        this.tickY++
        this.tickRotation++

        this._opts['x'] = this.newX.get(this.currentSlide('x'))
        this._opts['y'] = this.newY.get(this.currentSlide('y'))

        if(this.newR){
            this._opts['rotation'] = this.newR.get(this.currentSlide('rotation'))
        }
    }

    project(distance, rotation, relative=true) {
        if(rotation !== undefined && relative == true) {
            rotation = (this.UP + rotation) % 360
        }
        let np = new Point(projectFrom(this, distance, rotation))
        np.rotation = this.rotation
        return np
    }


}

class MainStage extends Stage {
    // canvas = document.getElementById('playspace');
    canvas = 'playspace'

    mounted(){
        let count = 10
        let multiplier = [400, 400, 5, 270]
        let offset = this.center.copy().subtract(multiplier[0] * .5)

        this.points = PointList.generate.random(count, multiplier, offset)
        this.points = this.points.cast(AutoLerpPoint)

        this.points.each.color = ()=>random.color([290, 310], [50,100], [22,60])
        this.points.each.radius = ()=>random.int(1, 15)


        this.targetPoint = 3
        this.dragging.add(this.points[0])
        this.tick = 0
    }

    // firstDraw(ctx) {
    //     ctx.lineCap = 'round'
    // }

    randomMove(p=this.point, c=this.center, v=200){
        // let forwMax = [5, 40]
        // let rot = [20, 50]
        // let rotMax = [4, 60]
        let forw = [1, 100]
        let forwMax = [5, 40]
        let rot = [20, 50]
        let rotMax = [4, 60]

        if(this.tick % random.int(...forw) == 0) {
            p.relative.forward(random.int(...forwMax))
            // p.rotation += random.int(-15, 15)
            // p.x = c.x + random.int(-v, v)
            // p.y = c.y + random.int(-v, v)
            // p.radius = random.int(.5, 7)
        }


        if(this.tick % random.int(...rot) == 0) {
            let c = random.int(...rotMax)
            p.rotation += random.int(-c, c)
            // p.x = c.x + random.int(-v, v)
            // p.y = c.y + random.int(-v, v)
            // p.radius = random.int(.5, 7)
        }
    }

    draw(ctx){
        this.tick++;
        this.clear(ctx)

        this.screenWrap.performMany(this.points)
        this.points.forEach(p=>{
            this.randomMove(p, this.center, 400)
            p.step()
        })

        // this.points.pen.fill(ctx)
        // this.points.pen.lines(ctx, { width: 2, color: '#111'})
        this.points.pen.indicator(ctx, { width: 2})
    }
}

stage = MainStage.go(/*{ loop: true }*/)
