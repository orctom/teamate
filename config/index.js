var config;

try {
    config = require('./config');
} catch (e) {
    config = require('./config.default');
}

process.env.NODE_ENV = config.env;

module.exports = config;