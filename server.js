/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


/* Begin user defined parameters */
/* ----------------------------- */
var USERNAME = 'coach@domain.com';
var PASSWORD = 'password';
var USER_IDS = [ '1' ];
var WINDOW_SIZE = 256 * 60 * 10;
var POLLING_MILLISECONDS = 5000;
var LOCAL_PORT = 3000;
/* ----------------------------- */
/*  End user defined parameters  */


var express = require('express');
var request = require('request');

var HEART_RATE_DATATYPE = '19';
var BREATHING_RATE_DATATYPE = '33';
var DEFAULT_OPTIONS = { headers: { "Accept": "application/json" } };

var app = express();
var users = {};
for(var cUser = 0; cUser < USER_IDS.length; cUser++) {
  var user = USER_IDS[cUser];
  users[user] = { hr: null, br: null };
}


app.get('/users/:user', function(req, res) {
  var data = users[req.params.user];
  if(data) {
    res.json(data);
  }
  else {
    res.status(404).send('User not found');
  }
});

app.use('/', express.static(__dirname + '/web'));


/**
 * Query the heartrate and breathing of a Hexoskin user.
 * @param {String} user The user ID.
 * @param {function} callback The function to call on completion.
 */
function queryHexoskinUser(user, callback) {
  var now = Math.floor(Date.now() / 1000 * 256);
  var url = 'https://reelyactive.hexoskin.com/api/data/?' +
            'start=' + (now - WINDOW_SIZE) + 
            '&end=' + now +
            '&user=' + user +
            '&datatype__in=' + HEART_RATE_DATATYPE +
            ',' + BREATHING_RATE_DATATYPE;

  request
    .get(url, DEFAULT_OPTIONS, function(error, response, body) {
      var json = JSON.parse(body);

      if(error) {
        return callback(error, user);
      }
      else if(Array.isArray(json) && (json.length > 0)) {
        data = json[0].data;
        user = json[0].user.substr(10).slice(0, -1);
        var heartrates = data[HEART_RATE_DATATYPE];
        var breathingrates = data[BREATHING_RATE_DATATYPE];
        var latestHR = heartrates[heartrates.length - 1][1];
        var latestBR = breathingrates[breathingrates.length - 1][1];
        return callback(null, user, latestHR, latestBR);
      }
      else {
        return callback('No data', user);
      }
    })
    .auth(USERNAME, PASSWORD);
}


/**
 * Update all users data.
 */
function updateAllUsers() {
  for(var cUser = 0; cUser < USER_IDS.length; cUser++) {
    var user = USER_IDS[cUser];
    queryHexoskinUser(user, function(err, user, hr, br) {
      if(err) {
        console.log('User ' + user + ': ' + err);
      }
      else {
        users[user].hr = hr;
        users[user].br = br;
      }
    });
  }
}


updateAllUsers();
setInterval(updateAllUsers, POLLING_MILLISECONDS);

app.listen(LOCAL_PORT, function () {
  console.log('Server listening on port ' + LOCAL_PORT);
});
