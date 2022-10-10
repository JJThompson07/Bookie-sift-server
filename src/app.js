const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dayjs = require('dayjs');

const ratings = require('./elo/ratings');
const sync = require('./elo/sync');
const convert = require('./elo/convert');

// ** brain js
const brain = require('./brain');
const eloBrain = require('./brain/elo');
const { seasonsToTraining } = require('./brain/training');

// ** Helpers
const { saveJson } = require('./helpers/jsonHelpers');
const { mergePredictions } = require('./helpers/predictions');
const { getSeasons } = require('./helpers/seasons');
const { getRawHistory, getRawFixtures, updateTeams } = require('./elo/history');
// const tf = require('./tf/test');

// ** football data and Elo apis
const { getSeason, getAllSeasons } = require('./football-data/history');
const { getFixtures } = require('./football-data/fixtures');
const { getElo } = require('./elo/api');

const app = express();
app.use(morgan('combine'));
app.use(bodyParser.json());
app.use(cors());

const today = dayjs().format('YYYY-MM-DD');

// ** Get the latest fixtures
// getFixtures('ENG', 0);
// getSeason();
// ** new version --- run first
// getAllSeasons();
// seasonsToTraining('ENG', 'form');

// ** run this to update Elo files for clubs of country passed
// ** run second
// updateTeams('ENG');

// ** run this to update Elo ratings for all the clubs for today
// ** -- run third
// ratings.save(today);

// ** run this with football data list of name as well as country code sync.save(data, code)
// sync.save();

// ** convert raw data from football-data
// ** history
// convert.convertRaw('ENG', 'history');
// ** fixtures
// convert.convertRaw('ENG', 'fixtures');
// ** probably can remove this
// convert.convertRaw('ENG', 'fixtures', true);

const bookiesTData = require('../data/training/ENG/seasons/bookies-home.json');
const formTData = require('../data/training/ENG/seasons/form-home.json');
const eloTData = require('../data/training/ENG/seasons/elo-home.json');

const training = async () => {
  // return await brain.train(bookiesTData, 'ENG', 'bookies-home');
  // return await brain.train(formTData, 'ENG', 'form-home');
  // return await brain.train(eloTData, 'ENG', 'elo-home');
  // return await eloBrain.train(tData, 'pl-history-elo-simple');
};

training();

const eloNet = require('../data/training/pre-trained/ENG/elo-home.json');
const bookiesNet = require('../data/training/pre-trained/ENG/bookies-home.json');
// const bookiesNet = require('../data/training/pre-trained/pl-history-bookies-simple.json');

const thisYear = require('../data/football-data/seasons/ENG/22.json');

let bookiesData = brain.predictionData(thisYear, 'bookies');
let eloData = brain.predictionData(thisYear, 'elo');

// brain.predictFromSaved(eloData, thisYear, eloNet, 'elo-home');
// brain.predictFromSaved(bookiesData, thisYear, bookiesNet, 'bookies-home');
// bookiesBrain.predictFromSaved(bookiesData, plFixtures, bookiesNet, '2022-simple');

// console.log(predicted);

// mergeEloBookies('2022-simple');
const first = require('../data/predictions/bookies/bookies-home.json');
const second = require('../data/predictions/bookies/elo-home.json');
mergePredictions(first, second, 'elo-bookies-home');

app.listen(process.env.PORT || 3000);
