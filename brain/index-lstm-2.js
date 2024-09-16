
const rows = [
  "I could really use a hot drink.",
  "Could you boil some water?",
  "I think it's tea time.",
  "The kettle could use some action.",
  "I feel like making some tea.",
  "Could you get the kettle going?",
  "Time for a cuppa.",
  "I need a warm drink.",
  "Would you mind turning on the kettle?",
  "I could go for some tea.",
  "Boil the kettle, please.",
  "A cup of tea sounds perfect right now.",
  "I'm in the mood for something warm to drink.",
  "Think I'll brew some tea.",
  "The kettle should be boiling soon.",
  "Let’s get some hot water going.",
  "I'm ready for a hot cup of tea.",
  "Could use a little boiling water.",
  "Kettle looking lonely, isn't it?"
]

const perform = function(){
  const net = new brain.recurrent.LSTM();

  /* dict  train method */
  // net.train([
  //   { input: 'I feel great about the world!', output: 'happy' },
  //   { input: 'The world is a terrible place!', output: 'sad' },
  // ]);

  const dRows = []

  rows.forEach(function(line) {
    dRows.push({ input: line, output: 'kettle'})
  })

  const result = net.train(dRows, {
      iterations: 1500,
      log: details => console.log(details),
      errorThresh: 0.011
  });

  const output = net.run("Hmm. I could do with a drink"); // 'happy'

    return output
}