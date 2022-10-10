const { boolToNumber } = require('../helpers/common');
const { saveJson } = require('../helpers/jsonHelpers');
const { getSeasons } = require('../helpers/seasons');

const convertToTraining = (data, feed, target) => {
  // different input types
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

    // different output types
    const outputs = {
      home: {
        h: boolToNumber(game.homeGoals > game.awayGoals),
        homeGoals: game.homeGoals / 10,
        awayGoals: game.awayGoals / 10
      },
      away: {
        a: boolToNumber(game.awayGoals > game.homeGoals),
        homeGoals: game.homeGoals / 10,
        awayGoals: game.awayGoals / 10
      },
      goals: {
        over: boolToNumber(game.homeGoals + game.awayGoals > 2.5),
        under: boolToNumber(game.homeGoals + game.awayGoals < 2.5),
        none: boolToNumber(game.homeGoals + game.awayGoals === 0)
      }
    };

    return {
      input: inputs[feed],
      output: outputs[target]
    };
  });

  return results;
};

const seasonsToTraining = async (country = 'ENG', feed = 'bookies', target = 'home') => {
  const seasons = getSeasons(country, 21);
  const flattened = seasons.flat();

  const converted = await convertToTraining(flattened, feed, target);

  saveJson(flattened, '/data/training/ENG/seasons', `all`);
  saveJson(converted, '/data/training/ENG/seasons', `${feed}-${target}`);
};

module.exports = { convertToTraining, seasonsToTraining };
