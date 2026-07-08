

getAccuracy = function(net, testData) {
  let hits = 0;
  testData.forEach((datapoint) => {
    const output = net.run(datapoint.input);
    const outputArray = [Math.round(output[0]), Math.round(output[1]), Math.round(output[2])];
    if (outputArray[0] === datapoint.output[0] && outputArray[1] === datapoint.output[1] && outputArray[2] === datapoint.output[2]) {
      hits += 1;
    }
  });
  return hits / testData.length;
}

const SPLIT = 99;
const trainData = DATA.slice(0, SPLIT);
const testData = DATA.slice(SPLIT + 1);

// https://github.com/BrainJS/brain.js
//create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork({
  activation: 'sigmoid', // activation function
  hiddenLayers: [2],
  iterations: 20000,
  learningRate: 0.5 // global learning rate, useful when training using streams
});

net.train(trainData);



let item = DATA[20]
const accuracy = getAccuracy(net, testData);
console.log('accuracy: ', accuracy);
const output = net.run(item.input);
const res = Array.from(output).map(v=>Math.round(v))
console.log('output: ', res);
console.log('expected: ', item.output);