const elo = require('./api');
const fs = require('fs');
const dayjs = require('dayjs');
const CustomParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(CustomParseFormat);

const getRawHistory = (code = eng) => {
  const raw = require(`../../data/raw/${code}/history.json`);

  return raw;
};

const getRawFixtures = (code = eng) => {
  const raw = require(`../../data/raw/${code}/fixtures.json`);

  return raw;
};

const getTeam = async name => {
  if (!name) {
    console.error('No team name provided in history search, please provide a name!');
    return;
  }
  let team = name.toUpperCase();

  return await elo.getElo(team);
};

const saveTeam = async (teamName, country = null) => {
  console.log(`saving... ${country}/${teamName}`);
  const callback = err => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`${teamName} json file saved correctly`);
    return;
  };

  const teamData = await getTeam(teamName);

  if (!teamData) {
    console.warn(`no team data for ${teamName}`);
    return;
  }

  const releventData = teamData.filter(team => {
    return dayjs(team.to, 'YYYY-MM-DD') > dayjs('2010-07-01', 'YYYY-MM-DD');
  });

  const jsonData = JSON.stringify(releventData, null, 2);

  // get folder and path
  const folder = [country].filter(Boolean).join('/');
  const path = [country, teamName].filter(Boolean).join('/');

  try {
    fs.mkdirSync(`./data/Elo/History/${folder}`, { recursive: true });
  } catch (e) {
    console.error('Cannot create folder ', e);
    return;
  }

  await fs.writeFile(`./data/Elo/History/${path}.json`, jsonData, callback);
  return;
};

const updateTeams = async (country = 'ENG') => {
  const teams = require(`../../data/Elo/Sync/${country}.json`);

  let number = 0;

  for (const team of teams) {
    number++;

    const name = team.eloName;

    await saveTeam(name, team.country);

    console.log(`team ${number} - complete`);
  }

  console.log(`all teams for ${country} saved!`);
};

module.exports = { getRawHistory, getRawFixtures, getTeam, saveTeam, updateTeams };
