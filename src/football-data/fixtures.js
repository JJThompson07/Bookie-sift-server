const axios = require('axios');
const dayjs = require('dayjs');
const c2j = require('../helpers/csvToJson');
const { saveJson } = require('../helpers/jsonHelpers');
const { toFixedNumber } = require('../helpers/common');

const getFixtures = async (country = 'ENG', level = 0) => {
  const code = [country.slice(0, 1), level].join('');
  let results;
  await axios
    .get(`https://www.football-data.co.uk/fixtures.csv`)
    .then(res => {
      const csv = res.data;
      results = c2j.convert(csv);
    })
    .catch(err => {
      console.error(err);
    });

  const fixtures = cleanFixtures(results, code, level);
  const today = dayjs().format('YYYY-MM-DD');

  if (fixtures.length) {
    saveJson(fixtures, `data/football-data/fixtures/${country}`, today);
  } else {
    console.log(`No fixtures available for ${today}! try again tomorrow!`);
  }
};

const cleanFixtures = (fixtures, code, level) => {
  const trimmed = [];
  console.log(code);

  fixtures.forEach(fixture => {
    if (fixture.div === code) {
      trimmed.push(fixture);
    }
  });

  const results = trimmed.map(fixture => {
    const dateFormat = fixture.date.length === 8 ? 'DD/MM/YY' : 'DD/MM/YYYY';
    const formattedDate = dayjs(fixture.date, dateFormat);
    const date = formattedDate.format('YYYY-MM-DD');
    const eloTo = formattedDate.subtract(1, 'day').format('YYYY-MM-DD');

    return {
      date,
      home: fixture.hometeam,
      away: fixture.awayteam,
      bHome: Number(fixture.b365h),
      bDraw: Number(fixture.b365d),
      bAway: Number(fixture.b365a),
      over: Number(fixture['avg>2.5']),
      under: Number(fixture['avg<2.5']),
      bhp: toFixedNumber(1 / Number(fixture.b365h)),
      bdp: toFixedNumber(1 / Number(fixture.b365d)),
      bap: toFixedNumber(1 / Number(fixture.b365a)),
      overp: toFixedNumber(1 / Number(fixture['avg>2.5'])),
      underp: toFixedNumber(1 / Number(fixture['avg<2.5'])),
      eloTo
    };
  });

  return results;
};

module.exports = { getFixtures };
