'use strict';

var tessel = require('tessel'),
  rfidlib = require('rfid-pn532');

var wifi = require('wifi-cc3000');
var network = "Miss Clara";
var password = "clara2014";

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
    security: 'wpa2',
    ssid: network,
    password: password,
    timeout: 30
  });
}

wifi.on('connect', function(err, data){
  // you're connected
  console.log("connect emitted", err, data);
  tessel.led[2].high();
});

wifi.on('disconnect', function(err, data){
  // wifi dropped, probably want to call connect() again
  console.log("disconnect emitted", err, data);
})

wifi.on('timeout', function(err){
  // tried to connect but couldn't, retry
  console.log("timeout emitted"); 
  connect();
});

wifi.on('error', function(err){
  // one of the following happened
  // 1. tried to disconnect while not connected
  // 2. tried to disconnect while in the middle of trying to connect
  // 3. tried to initialize a connection without first waiting for a timeout or a disconnect
  console.log("error emitted", err);
});

tryConnect();

var camera = require('./lib/camera')(tessel.port.B),
  rfid = rfidlib.use(tessel.port.D),
  shutter = tessel.led[3], // Set up an LED to notify when we're taking a picture
  ready = tessel.led[0]; // Set up an LED to notify when we're uploading to Twitter

var send = require('./lib/twitter'),
  servo = require('./lib/servo');

rfid.on('ready', function() {
  console.log('Ready to read RFID card');

  var busy = false;

  rfid.on('data', function(card) {
    
    console.log('UID:', card.uid.readInt32LE(0));

    if (!busy) snapAndSend('dc' + card.uid.readInt32LE(0), function() {
      busy = false;
    }, busy = true);
  });
});


function snapAndSend(cardId, done) {
  shutter.high();

  ready.toggle();

  servo.move(1, 1);

  camera
    .takePicture()
    .then(function(image) {
      shutter.low();
      // Save the image
      console.log('Sending image to twitter');

      send('A #drinkcoin was issued by @iteam1337 to #' + cardId, image, function(err){
        if (err) ready.toggle(); // toggle twice
        ready.toggle();

        console.log('done.', err);
        return done(err);
      });
    })
    .catch(function (err) {
      console.log('error taking image', err);
      return done(err);
    })
    .done(function () {
      servo.move(1, 0);
      setTimeout(servo.move.bind(servo, 1, 0.5), 2000);
    });
}