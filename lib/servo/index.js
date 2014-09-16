'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port['C']);
var servoPort = 16; // We have a servo plugged in at position 1

var messages = [ 0.135, 0.44, 0.77 ]; // this is where the servo positions are calibrated.

servo.ready = function(callback) {
  servo.move(servoPort, messages[0], callback);
};

servo.smileForTheCamera = function(callback) {
  servo.move(servoPort, messages[1], callback);
};

servo.retweet = function(callback) {
  servo.move(servoPort, messages[2], callback);
};

servo.on('ready', function () {

 //  Set the minimum and maximum duty cycle for servo 1.
 //  If the servo doesn't move to its full extent or stalls out
 //  and gets hot, try tuning these values (0.05 and 0.12).
 //  Moving them towards each other = less movement range
 //  Moving them apart = more range, more likely to stall and burn out
 //  

 servo.configure(servoPort, 0.04, 0.13, function () {
    console.log('servo configure');
 });
});

module.exports = servo;