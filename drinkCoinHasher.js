var nconf = require('nconf');
var crypto = require("crypto");

nconf.env().file('config.json');

module.exports = {
  hashDrinkCoinId: function(id, cb) {
  	var hashedId = '';
  	var salt = nconf.get('salt');
  	var sha256 = crypto.createHash('sha256');
  	sha256.update(salt + id + salt, 'utf8');
		hashedId = sha256.digest('hex');
		cb(hashedId.slice(-8));
  }
};