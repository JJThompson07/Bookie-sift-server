const dayjs = require('dayjs');
const elo = require('./api');
const fs = require('fs');

const get = async date => {
  if (!date) {
    console.error('No date provided, please provide a date!');
    return;
  }

  if (!dayjs(date).isValid()) {
    console.error('Date provided is invalid, please provide a valid date (YYYY-MM-DD)!');
    return;
  }

  const formatted = dayjs(date).format('YYYY-MM-DD');

  return await elo.getElo(formatted);
};

const today = async () => {
  const today = dayjs().format('YYYY-MM-DD');

  return await elo.getElo(today);
};

const save = async date => {
  const callback = err => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`${date} json file saved correctly`);
    return;
  };

  const teamData = await get(date);
  const jsonData = JSON.stringify(teamData, null, 2);

  fs.writeFile(`./data/Elo/Ratings/${date}.json`, jsonData, callback);
  return;
};

module.exports = { today, save };
