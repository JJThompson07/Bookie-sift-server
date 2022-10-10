const { slice } = require('@tensorflow/tfjs-node');
const axios = require('axios');
const dayjs = require('dayjs');
const { convert } = require('../elo/convert');
const { toFixedNumber } = require('../helpers/common');
const c2j = require('../helpers/csvToJson');
const { saveJson } = require('../helpers/jsonHelpers');

const getSeason = async (code = 'ENG', year = 22, level = 0) => {
  let results;
  const key = code.slice(0, 1);
  const nextYear = Number(year) + 1;
  await axios
    .get(`https://www.football-data.co.uk/mmz4281/${year}${nextYear}/${key}${level}.csv`)
    .then(res => {
      const csv = res.data;
      results = c2j.convert(csv);
    })
    .catch(err => {
      console.error(err);
    });

  // console.log(results);
  const fixtures = cleanSeason(results);
  const withForm = addForm(fixtures);
  const withElo = convert(withForm, code);
  const today = dayjs().format('YYYY-MM-DD');

  // todo: finish this;

  if (fixtures.length) {
    saveJson(withElo, `data/football-data/seasons/${code}`, `${year}`);
  }
};

const cleanSeason = fixtures => {
  const trimmed = [];

  fixtures.forEach(game => {
    if (game.date) {
      trimmed.push(game);
    }
  });

  const results = trimmed.map((fixture, index) => {
    const homeShotConv = toFixedNumber(Number(fixture.fthg) / Number(fixture.hst));
    const awayShotConv = toFixedNumber(Number(fixture.ftag) / Number(fixture.ast));
    const avOver = Number(fixture['avg>2.5']) || Number(fixture['bbav>2.5']);
    const avUnder = Number(fixture['avg<2.5']) || Number(fixture['bbav<2.5']);
    const dateFormat = fixture.date.length === 8 ? 'DD/MM/YY' : 'DD/MM/YYYY';
    const formattedDate = dayjs(fixture.date, dateFormat);
    const date = formattedDate.format('YYYY-MM-DD');
    const eloTo = formattedDate.subtract(1, 'day').format('YYYY-MM-DD');

    const revHome = 1 / Number(fixture.b365h);
    const revDraw = 1 / Number(fixture.b365d);
    const revAway = 1 / Number(fixture.b365a);

    const totalRev = revHome + revDraw + revAway;

    const bhp = toFixedNumber(revHome / totalRev);
    const bdp = toFixedNumber(revDraw / totalRev);
    const bap = toFixedNumber(revAway / totalRev);

    const xpHome = toFixedNumber(bhp * 3 + bdp);
    const xpAway = toFixedNumber(bap * 3 + bdp);

    return {
      date,
      home: fixture.hometeam,
      away: fixture.awayteam,
      homeGoals: Number(fixture.fthg),
      awayGoals: Number(fixture.ftag),
      hTHomeGoals: Number(fixture.hthg),
      hTAwayGoals: Number(fixture.htag),
      homeShotConv,
      awayShotConv,
      bHome: Number(fixture.b365h),
      bDraw: Number(fixture.b365d),
      bAway: Number(fixture.b365a),
      over: avOver,
      under: avUnder,
      bhp,
      bdp,
      bap,
      xpHome,
      xpAway,
      overp: toFixedNumber(1 / avOver),
      underp: toFixedNumber(1 / avUnder),
      eloTo
    };
  });

  return results;
};

const addForm = games => {
  const results = games.map((fixture, index) => {
    const homeHistory = games.slice(0, index).filter(game => {
      return [game.home].includes(fixture.home);
    });
    const awayHistory = games.slice(0, index).filter(game => {
      return [game.away].includes(fixture.away);
    });

    const homeFormLength = homeHistory.length;
    const awayFormLength = awayHistory.length;
    let homeForm = [];
    let awayForm = [];

    if (homeFormLength > 1) {
      let hLength = homeFormLength - 1;

      if (homeFormLength > 3) {
        hLength = 3;
      }

      for (let i = 0; i < hLength; i++) {
        const match = homeHistory[i];
        const points =
          match.homeGoals > match.awayGoals ? 3 : match.homeGoals < match.awayGoals ? 0 : 1;
        homeForm.push(toFixedNumber(points - match.xpHome));
      }
    }

    if (awayFormLength > 1) {
      let aLength = awayFormLength - 1;
      if (awayFormLength > 4) {
        aLength = 3;
      }

      for (let i = 0; i < aLength; i++) {
        const match = awayHistory[i];
        const points =
          match.homeGoals > match.awayGoals ? 0 : match.homeGoals < match.awayGoals ? 3 : 1;

        awayForm.push(toFixedNumber(points - match.xpAway));
      }
    }

    let homeFormP = null;
    let awayFormP = null;

    if (homeForm.length) {
      const sum = homeForm.reduce((a, b) => a + b);
      homeFormP = sum / (homeForm.length * 3);
    }

    if (awayForm.length) {
      const sum = awayForm.reduce((a, b) => a + b);
      awayFormP = sum / (awayForm.length * 3);
    }

    return {
      ...fixture,
      homeForm,
      awayForm,
      homeFormP,
      awayFormP
    };
  });

  return results;
};

const getAllSeasons = async (country = 'ENG', level = 0) => {
  const first = 10;
  const thisYear = Number(dayjs().format('YY'));
  const years = [];

  for (let i = first; i < thisYear + 1; i++) {
    years.push(i.toString());
  }

  for (const year of years) {
    await getSeason(country, year, level);
  }
};

module.exports = { getSeason, getAllSeasons };
