var config;

try {
    config = require('./config');
} catch (e) {
    config = require('./config.default');
}

module.exports = config;