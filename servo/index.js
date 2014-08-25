'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port['C']);

servo.on('ready', function() {
  servo.configure(1, 0.05, 0.12, function() {
    servo.move(1, 0);
  });
});

