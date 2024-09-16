const lstmExampleOriginal = function() {

    const trainingData = [
      'Jane saw Doug.',
      'Doug saw Jane.',
      'Spot saw Doug and Jane looking at each other.',
      'It was love at first sight, and Spot had a frontrow seat. It was a very special moment for all.'
    ];

    const lstm = new brain.recurrent.LSTM();
    const result = lstm.train(trainingData, {
      iterations: 1500,
      log: details => console.log(details),
      errorThresh: 0.011
    });

    const run2 = lstm.run('Jane');
    const run1 = lstm.run('saw');
    const run4 = lstm.run('each');

    console.log('run 1: saw' + run1);
    console.log('run 2: Jane' + run1);
    console.log('run 4: It' + run4);
}


const lstmExample = function() {

    const trainingData = [
      'eggs and bacon.',
      'bacon and cheese.',
      'full english breakfast with runny eggs.',
      'hard boiled eggs, bacon, and cheese.'
    ];

    const lstm = new brain.recurrent.LSTM();
    const result = lstm.train(trainingData, {
      iterations: 1500,
      log: details => console.log(details),
      errorThresh: 0.011
    });

    runModel(lstm, "eggs");
    runModel(lstm, "english");
    runModel(lstm, "bacon");
}


const runModel = function(lstm, input) {
    console.log('Running:', input)
    const run1 = lstm.run(input)
    console.log('result:', run1)
}
lstmExample()