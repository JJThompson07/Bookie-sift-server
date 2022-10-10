const brain = require('brain.js');
const { saveJson } = require('../helpers/jsonHelpers');

const bookiesAccuracy = 0.62; // bookies prediction of Home team win or not Home

// provide optional config object (or undefined). Defaults shown.
const config = {
  iterations: 20000,
  errorThresh: 0.05,
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

const predictionData = (data, feed = 'bookies') => {
  const results = data.map(game => {
    const inputs = {
      bookies: {
        home: game.bhp,
        draw: game.bdp,
        away: game.bap
      },
      elo: {
        homeElo: game.homeElo / 2200,
        awayElo: game.awayElo / 2200,
        eloE: game.eloE
      },
      form: {
        home: game.homeFormP,
        away: game.awayFormP
      }
      // xg: {
      //   home: homeXg,
      //   away: awayXg
      // }
    };
    return inputs[feed];
  });
  return results;
};

const train = async (data, path, filename) => {
  console.log('starting training...');

  await net.train(data, { log: error => console.log(error) });

  const network = net.toJSON();

  saveJson(network, `data/training/pre-trained/${path}`, filename);

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

  saveJson(results, 'data/predictions/bookies', filename);

  return results;
};

const singlePredict = async (data, network) => {
  const savedNetwork = net.fromJSON(network);

  const result = await savedNetwork.run(data);

  const readable = {
    ...result,
    homeGoals: Number((result.homeGoals * 10).toFixed(2)),
    awayGoals: Number((result.awayGoals * 10).toFixed(2))
  };

  console.log(readable);
};

module.exports = {
  train,
  predictionData,
  predict,
  predictFromSaved,
  singlePredict
};
