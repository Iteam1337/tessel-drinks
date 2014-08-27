var cameralib = require('camera-vc0706'),
  Q = require('q');

module.exports = function (port) {
  var camera = cameralib.use(port);

  return {
    takePicture: function () {
      var deferred = Q.defer();

      camera.takePicture(function (err, image) {
        if(err) {
          return deferred.reject(err);
        } else {
          return deferred.resolve(image);
        }
      });

      return deferred.promise;
    }
  };
};