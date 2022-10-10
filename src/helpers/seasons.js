const dayjs = require('dayjs');
const CustomParseFormat = require('dayjs/plugin/customParseFormat');
var isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(CustomParseFormat);
dayjs.extend(isBetween);

const getSeasons = (country = 'ENG', latest = null) => {
  const first = 10;
  const thisYear = Number(latest) || Number(dayjs().format('YY'));
  const years = [];
  const seasons = [];

  for (let i = first; i < thisYear + 1; i++) {
    years.push(i.toString());
  }

  for (const year of years) {
    const season = require(`../../data/football-data/seasons/${country}/${year}.json`);
    seasons.push(season);
  }

  return seasons;
};

module.exports = { getSeasons };
