var env = process.env.NODE_ENV || 'development';
var config;
try {
    config = require('./config');
} catch (e) {
    config = require('./config.default');
}

config.env = env;

module.exports = config;