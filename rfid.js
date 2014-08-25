'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var camera = require('camera-vc0706').use(tessel.port.B);
var shutter = tessel.led[3]; // Set up an LED to notify when we're taking a picture
var ready = tessel.led[0]; // Set up an LED to notify when we're uploading to Twitter
var send = require('./twitter');

var rfid = rfidlib.use(tessel.port.A);

rfid.on('ready', function() {
  console.log('Ready to read RFID card');

  var busy = false;

  rfid.on('data', function(card) {
    console.log('UID:', card.uid.toString('hex'));

    if (!busy) snapAndSend(function() {
      busy = false;
    }, busy = true);
  });
});


function snapAndSend(done) {
  shutter.high();

  ready.toggle();

  camera.takePicture(function(err, image) {

    if (err) {
      console.log('error taking image', err);
      return done(err);
    } else {
      shutter.low();
      // Save the image
      console.log('Sending image to twitter');

      send('A #drinkcoin was issued by @iteam1337 at @NordicJs to ', image, function(err){
        if (err) ready.toggle(); // toggle twice
        ready.toggle();

        console.log('done.', err);
        return done(err);

      });
    }
  });
}

camera.on('error', function(err) {
  console.error(err);
});