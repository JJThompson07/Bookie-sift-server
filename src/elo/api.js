const axios = require('axios');
const c2j = require('../helpers/csvToJson');

const getElo = async search => {
  if (!search) {
    console.error('No search term provided for elo api call');
  }

  console.log(search);

  let results;
  await axios
    .get(`http://api.clubelo.com/${search}`)
    .then(res => {
      const csv = res.data;
      results = c2j.convert(csv);
    })
    .catch(err => {
      console.error(err);
    });

  return results;
};

module.exports = { getElo };
