const brain = require('brain.js');
const { saveJson } = require('../helpers/jsonHelpers');

// provide optional config object (or undefined). Defaults shown.
const config = {
  iterations: 20000,
  errorThresh: 0.01,
  learningRate: 0.0005,
  logPeriod: 100,
  inputSize: 3,
  outputSize: 3,
  hiddenLayers: [6, 6, 3], // array of ints for the sizes of the hidden layers in the network
  activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  leakyReluAlpha: 0.01 // supported for activation type 'leaky-relu'
};

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork(config);

const trainingData = data => {
  const results = data.map(game => {
    const hResult = {
      H: 1,
      D: 0,
      A: 0
    };

    const aResult = {
      H: 0,
      D: 0,
      A: 1
    };

    const homeGoals = game.homeGoals / 10;
    const awayGoals = game.awayGoals / 10;
    return {
      input: {
        homeElo: game.homeElo / 2200,
        awayElo: game.awayElo / 2200,
        // eloDiff: game.eloDiff / 2200,
        // eloAv: (game.homeElo + game.awayElo) / 2 / 2200,
        eloE: game.eloE
      },
      output: {
        h: hResult[game.result],
        // a: aResult[game.result],
        homeGoals,
        awayGoals
      }
    };
  });
  return results;
};

const predictionData = data => {
  const results = data.map(game => {
    return {
      homeElo: game.homeElo / 2200,
      awayElo: game.awayElo / 2200,
      eloDiff: game.eloDiff / 2200,
      eloAv: (game.homeElo + game.awayElo) / 2 / 2200,
      eloE: game.eloE || game.E
    };
  });
  return results;
};

const train = async (data, filename) => {
  console.log('starting training...');

  await net.train(data, { log: error => console.log(error) });

  const network = net.toJSON();

  saveJson(network, 'data/training/pre-trained', filename);

  console.log('training complete!');
  return;
};

const predict = (data, network) => {
  let results;

  if (network) {
    const savedNetwork = net.fromJSON(network);

    results = savedNetwork.run(data);
  } else {
    results = net.run(data);
  }

  return results;
};

const predictFromSaved = async (data, games, network, filename) => {
  let results = [];

  const savedNetwork = net.fromJSON(network);

  for (const index in data) {
    const pred = await savedNetwork.run(data[index]);

    const display = {
      date: games[index].date,
      home: games[index].home,
      away: games[index].away,
      ...pred,
      homeGoals: Number((pred.homeGoals * 10).toFixed(4)),
      awayGoals: Number((pred.awayGoals * 10).toFixed(4))
    };

    results.push(display);
  }

  saveJson(results, 'data/predictions/elo', filename);

  return results;
};

module.exports = {
  trainingData,
  train,
  predictionData,
  predict,
  predictFromSaved
};
