'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var crypto = require('crypto');

var wifi = require('wifi-cc3000');
var network = 'Artipelag Guest';
var password = 'penthouse';

function hashDrinkCoinId(id, cb) {
  var hashedId = '';
  var salt = 'i1t3e3a7m';
  var md5 = crypto.createHash('md5');
  md5.update(salt + id + salt, 'utf8');
  hashedId = md5.digest('hex');
  console.log('Hashed UID:', hashedId);
  cb(hashedId);
}

function tryConnect() {
  if (!wifi.isBusy()){
    connect();
  } else {
    console.log('wifi is busy, try again');
    setTimeout(function(){
      tryConnect();
    }, 1000);
  }
}

function connect() {
  wifi.connect({
    //security: 'wpa2',
    ssid: network,
    //password: password,
    timeout: 90
  });
}

wifi.on('connect', function(err, data){
  // you're connected
  console.log('connect emitted', err, data);
  tessel.led[2].high();
  flash(1);
  setTimeout(function(){ flash(0); }, 1000);
});

wifi.on('disconnect', function(err, data){
  // wifi dropped, probably want to call connect() again
  console.log('disconnect emitted', err, data);
  setTimeout(function() {
      console.log('reconnecting wifi...');
      connect();
    }, 5000);
});

wifi.on('timeout', function(err){
  // tried to connect but couldn't, retry
  console.log('wifi timeout emitted'); 
  connect();
});

wifi.on('error', function(err){
  // one of the following happened
  // 1. tried to disconnect while not connected
  // 2. tried to disconnect while in the middle of trying to connect
  // 3. tried to initialize a connection without first waiting for a timeout or a disconnect
  console.log('error emitted', err);
  tessel.led[1].high();
});

// tryConnect();

var camera = require('./lib/camera')(tessel.port.A),
  rfid = rfidlib.use(tessel.port.D),
  shutter = tessel.led[3], // Set up an LED to notify when we're taking a picture
  ready = tessel.led[0]; // Set up an LED to notify when we're uploading to Twitter

var send = require('./lib/twitter'),
  servo = require('./lib/servo');

rfid.on('ready', function() {
  console.log('Ready to read RFID card');

  var busy = false;
  servo.ready(function (err) {
    if (err) {
      console.log('Servo error in ready()', err);
    }
    console.log('Servo moved to start position');
  });

  rfid.on('data', function(card) {

    servo.smileForTheCamera(function (err) {
      if (err) {
        console.log('Servo error in smileForTheCamera()', err);
      }
      console.log('Servo moved to second position');
      console.log('UID:', card.uid.readInt32LE(0));

      if (!busy) {
        hashDrinkCoinId(card.uid.readInt32LE(0), function(hashedId) {
          snapAndSend('dc' + hashedId, function() {
            busy = false;
            servo.ready(function (err) {
              if (err) {
                console.log('Servo error in ready()', err);
              }
              console.log('Servo moved to start position');
            });
          }, busy = true);
        });
        
      }
    });
  });
});

function flash(val) {
  tessel.port['B'].digital[0].output(val);
} 

function snapAndSend(cardId, done) {
  shutter.high();

  ready.toggle();
  console.log('flash?');
  var initialDelay = 1000;
  var flicker = 30;
  var flashLength = 250;
  var flickers = 10;
  for (var i = 0; i < flickers; i++) {
    setTimeout(flash.bind(null, i % 2), initialDelay + i * flicker);
  }

  setTimeout(function() {
    flash(1);
    camera
      .takePicture()
      .then(function(image) {
        shutter.low();
        // Save the image
        console.log('Sending image to twitter', cardId);
        
        servo.retweet(function(err){
          if (err){
            console.log('Servo error in reweet()', err);
          }
          console.log('Servo moved to RT position');
          setTimeout(function() {
            //ready.toggle(); // remove when un-commenting below
            //done(); // remove when un-commenting below
            send('A #drinkcoin was issued by @iteam1337 to #' + cardId + ' at #nordicjs', image, function(err){
              if (err) ready.toggle(); // toggle twice
              ready.toggle();
              console.log('done.', err);
              return done(err);
            });
          }, 3000);
          //process.sendfile('meow.jpg', image); // To save file locally - run tessel with -u ./
        });
      })
      .catch(function (err) {
        console.log('error taking image', err);
        return done(err);
      })
      .done(function () {
        console.log('Camera takePicture() done');
      });  
  }, initialDelay + flickers * flicker);
  setTimeout(function() {flash(0);}, initialDelay + flickers * flicker + flashLength);
  
}