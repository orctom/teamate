var winston = require('winston');

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true
        }),
        new(winston.transports.File)({
            filename: '/app/logs/teamate.log'
        })
    ],
    exceptionHandlers: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true
        }),
        new(winston.transports.File)({
            filename: '/app/logs/teamate-exception.log'
        })
    ],
    exitOnError: false
});

module.exports = logger;