'use strict';

var tessel = require('tessel');
var rfidlib = require('rfid-pn532');
var camera = require('camera-vc0706').use(tessel.port['B']);
var led = tessel.led[3]; // Set up an LED to notify when we're taking a picture
var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port['C']);

servo.on('ready', function () {
  //var position = 0;  //  Target position of the servo between 0 (min) and 1 (max).

  //  Set the minimum and maximum duty cycle for servo 1.
  //  If the servo doesn't move to its full extent or stalls out
  //  and gets hot, try tuning these values (0.05 and 0.12).
  //  Moving them towards each other = less movement range
  //  Moving them apart = more range, more likely to stall and burn out
  servo.configure(1, 0.05, 0.12, function () {
    servo.move(1, 0);
    //setInterval(function () {
      //console.log('Position (in range 0-1):', position);
      //  Set servo #1 to position pos.
      //servo.move(1, position);

      // Increment by 10% (~18 deg for a normal servo)
      //position += 0.1;
      //if (position > 1) {
      //  position = 0; // Reset servo position
     // }
    //}, 500); // Every 500 milliseconds
  });
});

var rfid = rfidlib.use(tessel.port['A']);

rfid.on('ready', function(version) {
  console.log('Ready to read RFID card');

  rfid.on('data', function(card) {
    console.log('UID:', card.uid.toString('hex'));

    takePicture();
  });
});


function takePicture() {
  led.high();

  servo.move(1, 1);

  camera.takePicture(function(err, image) {
    
    if (err) {
      console.log('error taking image', err);
    } else {
      led.low();
      // Name the image
      var name = 'picture-' + Date.now() + '.jpg';
      // Save the image
      console.log('Picture saving as', name, '...');
      process.sendfile(name, image);
      servo.move(1, 0);
      console.log('done.');
    }
  });
}

camera.on('error', function(err) {
  console.error(err);
});