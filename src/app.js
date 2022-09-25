
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const history = require('./elo/history');
const ratings = require('./elo/ratings');
const fs = require('fs');
const dayjs = require('dayjs');

const app = express();
app.use(morgan('combine'));
app.use(bodyParser.json());
app.use(cors());

// get
// post
// put
// patch
// delete

app.get('/', (req, res) => {
  res.send({
    message: "Hello world!"
  })
});

app.post('/register', (req, res) => {
  res.send({
    message: `Hi ${req.body.username}, User registered!`
  })
});

const teams = require('../data/Elo/Ratings/2022-09-25.json');

const length = teams.length;

let number = 0

async function saveClubs() {
  for (const team of teams) {

    if (team.club) {
      number ++ 
      
      const name = team.club.replace(/\s/g, '').toLowerCase();
  
      await history.save(team.club.replace(/\s/g, '').toLowerCase(), team.country, team.level);

      console.log(`team ${number} - complete`)
    }
  }
}

saveClubs();

// history.save(teams[number].club.replace(/\s/g, '').toLowerCase(), teams[number].country, teams[number].level);


// history.save('mancity');

const today = dayjs().format('YYYY-MM-DD');

// ratings.save(today);


app.listen(process.env.PORT || 3000);