const dayjs = require('dayjs');
const CustomParseFormat = require('dayjs/plugin/customParseFormat');
const { trimName, saveJson } = require('../helpers/jsonHelpers');

dayjs.extend(CustomParseFormat);

const getRaw = (code = 'ENG', type = 'history') => {
  const raw = require(`../../data/raw/${code}/${type}.json`);

  return raw;
};

const convertRaw = (country = 'ENG', type, today = false, convertDate = false) => {
  const names = require(`../../data/Elo/Sync/${country}.json`);

  let raw;

  if (today) {
    const todayDate = dayjs().format('YYYY-MM-DD');
    raw = require(`../../data/football-data/fixtures/${country}/${todayDate}`);
  } else {
    raw = getRaw(country, type);
  }

  const results = convert(raw, country, convertDate);

  // if (today) {
  //   saveJson(results, `data/training/${country}/test`, 'fixtures');
  // } else {
  //   saveJson(results, `data/training/${country}/fromRaw`, type);
  // }

  console.log(`${country} data converted and saved to training`);
  return;
};

const convert = (data, country, convertDate = false) => {
  const names = require(`../../data/elo/sync/${country}.json`);

  const results = [];
  let success = 0;
  let fail = 0;
  data.forEach(game => {
    const dateformat = convertDate ? 'DD/MM/YYYY' : 'YYYY-MM-DD';
    const formattedDate = dayjs(game.date, dateformat);
    const date = formattedDate.format('YYYY-MM-DD');
    const eloTo = formattedDate.subtract(1, 'day').format('YYYY-MM-DD');

    const homeName = names.find(name => {
      return name.footballData === trimName(game.home);
    }).eloName;

    const awayName = names.find(name => {
      return name.footballData === trimName(game.away);
    }).eloName;

    const homeHistory = require(`../../data/elo/history/${country}/${homeName}.json`);
    const awayHistory = require(`../../data/elo/history/${country}/${awayName}.json`);

    const homeElo = homeHistory.find(elo => elo.to === date);
    if (!homeElo) {
      console.log(`home game ${date} - ${game.home} not found`);
    }
    const awayElo = awayHistory.find(elo => elo.to === date);
    if (!awayElo) {
      console.log(`away game ${date} - ${game.away} not found`);
    }

    if (homeElo && awayElo) {
      const homeRating = Math.round(homeElo.elo);
      const awayRating = Math.round(awayElo.elo);
      const eloDiff = homeRating - awayRating;
      const eloE = Number((1 / (10 ^ (-eloDiff / 400 + 1))).toFixed(3));
      results.push({
        ...game,
        date,
        eloTo,
        home: homeName,
        away: awayName,
        homeElo: homeRating,
        awayElo: awayRating,
        eloDiff,
        eloE
      });

      success++;
    } else {
      fail++;
    }
  });

  return results;
};

module.exports = { convertRaw, convert };
