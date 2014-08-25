'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var camera = require('camera-vc0706').use(tessel.port['B']);
var led = tessel.led[3]; // Set up an LED to notify when we're taking a picture
var servolib = require('servo-pca9685');
var twitterPost = require('./twitter');

var servo = servolib.use(tessel.port['C']);

servo.on('ready', function() {
  servo.configure(1, 0.05, 0.12, function() {
    servo.move(1, 0);
  });
});

var rfid = rfidlib.use(tessel.port['A']);

rfid.on('ready', function(version) {
  console.log('Ready to read RFID card');

  var busy = false;

  rfid.on('data', function(card) {
    console.log('UID:', card.uid.toString('hex'));

    if (!busy) takePicture(function() {
      busy = false;
    }, busy = true);
  });
});


function takePicture(done) {
  led.high();

  servo.move(1, 1);

  camera.takePicture(function(err, image) {

    if (err) {
      console.log('error taking image', err);
    } else {
      led.low();
      // Save the image
      console.log('Sending image to twitter');

      twitterPost('Testing #tessel with rfid', image);

      process.sendfile(name, image);
      servo.move(1, 0);
      console.log('done.');
    }
  });
}

camera.on('error', function(err) {
  console.error(err);
});