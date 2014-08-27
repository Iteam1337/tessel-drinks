'use strict';

var tessel = require('tessel'),
  rfidlib = require('rfid-pn532');

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
    console.log('UID:', card.uid.toString('hex'));

    if (!busy) snapAndSend(function() {
      busy = false;
    }, busy = true);
  });
});


function snapAndSend(done) {
  shutter.high();

  ready.toggle();

  servo.move(1, 1);

  camera
    .takePicture()
    .then(function(image) {
      shutter.low();
      // Save the image
      console.log('Sending image to twitter');

      send('A #drinkcoin was issued by @iteam1337 at @NordicJs to ', image, function(err){
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