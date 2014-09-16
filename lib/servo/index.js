'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port['C']);
var servo1 = 1; // We have a servo plugged in at position 1

var messages = [ 0.15, 0.49, 0.83 ];

servo.ready = function(callback) {
  servo.move(servo1, 0.15, callback);
};

servo.smileForTheCamera = function(callback) {
  servo.move(servo1, 0.49, callback);
};

servo.retweet = function(callback) {
  servo.move(servo1, 0.83, callback);
};

servo.on('ready', function () {
 //var position = 0;  //  Target position of the servo between 0 (min) and 1 (max).

 //  Set the minimum and maximum duty cycle for servo 1.
 //  If the servo doesn't move to its full extent or stalls out
 //  and gets hot, try tuning these values (0.05 and 0.12).
 //  Moving them towards each other = less movement range
 //  Moving them apart = more range, more likely to stall and burn out
 //  
 //var messages = [ 0.15, 0.49, 0.83 ];
 //var atMessage = 0;

 servo.configure(servo1, 0.04, 0.13, function () {
   /*setInterval(function () {

     servo.move(servo1, messages[atMessage]);

     atMessage = (atMessage + 1) % messages.length;
   }, 2000);*/ // Every 500 milliseconds
 });
});

module.exports = servo;