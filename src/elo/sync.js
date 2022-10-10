const fs = require('fs');
const { trimName } = require('../helpers/jsonHelpers');

const cleanData = data => {
  if (!data) {
    console.error('no data provided');
  }
  data.map(team => {
    return trimName(team);
  });
};

const save = async (data, code) => {
  const callback = err => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`${code} json file saved correctly`);
    return;
  };

  // create team json
  let results = [];
  for (const team of cleanData(data)) {
    let eloName = team.toLowerCase();
    if (team === "nott'mforest") {
      eloName = 'forest';
    }

    let teamObj = {
      country: code,
      eloName,
      footballData: team.toLowerCase()
    };

    results.push(teamObj);
  }

  // convert json for creating a file
  const jsonData = JSON.stringify(results, null, 2);

  try {
    fs.mkdirSync(`./data/Elo/Sync`, { recursive: true });
  } catch (e) {
    console.error('Cannot create folder ', e);
    return;
  }

  await fs.writeFile(`./data/Elo/Sync/${code}.json`, jsonData, callback);
  return;
};

module.exports = { cleanData, save };
