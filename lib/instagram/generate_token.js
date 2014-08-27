

var express = require('express');
var api = require('instagram-node').instagram();
var app = express();
var http = require('http');

api.use({
  client_id: 'cd630793aaa34794b2deb0f1aea1f5ee',
  client_secret: '07a24acd6edc48fb988bac2f8d1cd4c4'
});

var redirect_uri = 'http://localhost:5000/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};

exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send('Didn\'t work');
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};

// This is where you would initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is your redirect URI
app.get('/handleauth', exports.handleauth);

http.createServer(app).listen(app.get('port') || 5000, function(){
  console.log('Express server listening on port ' + app.get('port') || 5000);
});