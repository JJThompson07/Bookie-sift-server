const elo = require('./api');
const fs = require('fs');

const get = async (name) => {
    if (!name) {
      console.error(
        'No team name provided in history search, please provide a name!'
      );
      return;
    }
  let team = name.toUpperCase();

    return await elo.eloCall(team);
}

const save = async (teamName, country = null, level = null) => {
  console.log(`saving... ${country}/${level}/${teamName}`);
  const callback = (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`${teamName} json file saved correctly`);
    return;
  }
  
  const teamData = await get(teamName);
  
  if (!teamData) {
    console.warn(`no team data for ${teamName}`);
    return;
  }

  const jsonData = JSON.stringify(teamData, null, 2);

  const folder = [country, level].filter(Boolean)
    .join('/');
  
  const path = [country, level, teamName].filter(Boolean)
  .join('/');
  
  try {
      fs.mkdirSync(`./data/Elo/History/${folder}`, { recursive: true } );
  } catch (e) {
    console.error('Cannot create folder ', e);
    return;
  }

  await fs.writeFile(`./data/Elo/History/${path}.json`, jsonData, callback);
  return;
}
  
module.exports = { get, save }