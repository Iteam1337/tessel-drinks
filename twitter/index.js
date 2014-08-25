'use strict';

// Node requires
var https = require('https');
var crypto = require('crypto');

// Set up to Tweet
var bound = require('crypto').pseudoRandomBytes(16).toString('hex');
var ctype = 'multipart/form-data; boundary=' + bound;

// Tweeting as @TesselTweet
var oauth_consumer_key = "Zic5Yqw9puVf1ERbbWpFKtkoV";
var oauth_consumer_secret = "3aBBcxbnFhWolv3z6soIczyXpGxuquahml1kMOMV3tiG6zB5jc";
var oauth_access_token = "304297221-tpMIuRdFWbzpUdfRmlzAlGn6YVeNhrzYX0e7KWVE";
var oauth_access_secret = "uKydZis5fAEr2Mug4dLGV2SzpGIICTZZJPWHTlH7u9fa0";
 
// Get time
var curtime = parseInt(process.env.DEPLOY_TIMESTAMP || Date.now());

// Set up OAuth
var oauth_data = {
    oauth_consumer_key: oauth_consumer_key,
    oauth_nonce: require('crypto').pseudoRandomBytes(32).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(curtime / 1000),
    oauth_token: oauth_access_token,
    oauth_version: '1.0'
};
 
var out = [].concat(
    ['POST', 'https://api.twitter.com/1.1/statuses/update_with_media.json'],
    (Object.keys(oauth_data).sort().map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(oauth_data[k]);
    }).join('&'))
).map(encodeURIComponent).join('&');
 
oauth_data.oauth_signature = crypto
  .createHmac('sha1', [oauth_consumer_secret, oauth_access_secret].join('&'))
  .update(out)
  .digest('base64');
 
var auth_header = 'OAuth ' + Object.keys(oauth_data).sort().map(function (key) {
    return key + '="' + encodeURIComponent(oauth_data[key]) + '"';
}).join(', ');


function post(status, file, done) {
  var req = https.request({
    port: 443,
    method: 'POST',
    hostname: 'api.twitter.com',
    path: '/1.1/statuses/update_with_media.json',
    headers: {
      Host: 'api.twitter.com',
      'Accept': '*/*',
      'User-Agent': 'tessel',
      'Authorization': auth_header,
      'Content-Type': ctype,
      'Connection': 'keep-alive'
    }
  }, function(res) {
      console.log('statusCode: ', res.statusCode);
      console.log('headers: ', res.headers);

      if (200 === res.statusCode){
        return done && done();
      } else {
        return done && done(res.statusCode);
      }

      res.on('data', function(d) {
        console.log(' ');
        console.log(' ');
        console.log(String(d));
      });
  });

  req.write('--' + bound + '\r\n');
  req.write('Content-Disposition: form-data; name="status"\r\n');
  req.write('\r\n');
  req.write(status + '\r\n');
  req.write('--' + bound + '\r\n');
  req.write('Content-Type: application/octet-stream\r\n');
  req.write('Content-Disposition: form-data; name="media[]"; filename="test.jpg"\r\n');
  req.write('\r\n');
  req.write(file);
  req.write('\r\n');
  req.write('--' + bound + '--\r\n');
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
}

module.exports = post;