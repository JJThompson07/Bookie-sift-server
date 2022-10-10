const { saveJson } = require('./jsonHelpers');
const { toFixedNumber } = require('./common');

const mergePredictions = (first, second, filename) => {
  if (!first || !second) {
    console.log('please provide data');
    return;
  }

  const merged = first.map(pred => {
    const matched = second.find(bPred => {
      return bPred.date === pred.date && bPred.home === pred.home && bPred.away === pred.away;
    });

    let overs = '';

    const homeLimit = 1.135;
    const awayLimit = 1.425;

    const homeGoals = toFixedNumber((pred.homeGoals + matched.homeGoals) / 2);
    const awayGoals = toFixedNumber((pred.awayGoals + matched.awayGoals) / 2);

    if (homeGoals > homeLimit && awayGoals > awayLimit) {
      overs = 'over';
    }

    return {
      ...pred,
      h: Number(((pred.h + matched.h) / 2).toFixed(3)),
      homeGoals,
      awayGoals,
      over: overs
    };
  });

  saveJson(merged, 'data/predictions/merged', filename);
};

module.exports = { mergePredictions };
