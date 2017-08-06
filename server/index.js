'use strict';

const Config = require('./config');
const Hapi = require('hapi');
const Poop = require('poop');
const moment = require("moment");
const jwt = require("jsonwebtoken");

const winston = require('winston');
require('winston-daily-rotate-file');

const DataModel = require("../db");

// Create a server with a host and port
const server = new Hapi.Server({});
server.connection({
    host: '0.0.0.0',
    port: 8000
});

server.app.jwtKey = "f49b26e0-cdf1-4dc3-8379-de07b32b13c9";
server.app.jwtValidTimespan = 3600;

const validateFunc = (decoded, request, callback) => {
    return callback(null, true);
};

server.register(require("hapi-qs"), err => {
    if (err) {
        console.log(err);
    }
});

server.register(require('hapi-auth-jwt2'), function (err) {

    if(err){
        console.log(err);
    }

    server.auth.strategy('jwt', 'jwt',
        {
            key: server.app.jwtKey,
            validateFunc: validateFunc,
            verifyOptions: { algorithms: [ 'HS256' ] }
        });

    server.auth.default('jwt');
});

server.register({
    register: Poop,
    options: {
        logPath: './poop.log'
    }
}, (err) => {
    if (err) {
        console.error(err);
    }
    //throw new Error('uncaught'); //for testing heap dump
});

server.register({
    register: require("../api")
}, {
    routes: {
        prefix: "/api"
    }
}, (err) => {
    if (err) {
        console.error(err);
    }
});


server.app.database = new DataModel();

if (!Config.db_logging) {
    server.app.database._db.sequelize.options.logging = false;
}

//make sure unhandled exceptions are logged
server.on('request-error', (request, response) => {
        request.server.app.logger.error(response);
    }
);

server.ext({
    type: "onPostAuth",
    method: async (request, reply) => {
        if (request.auth.isAuthenticated) {
            
            //TODO load user details for currently loggedin user
        }
        reply.continue();
    }
});

server.ext({
    type: "onPreResponse",
    method: async (request, reply) => {
        const response = request.response;

        if (response.isBoom) {
            request.server.app.trace_logger.info({
                path:request.route.path, 
                method: request.route.method, 
                fingerprint: request.route.fingerprint, 
                code: response.output.statusCode,
                payload: response.output.payload
            });
        } else {
            request.server.app.trace_logger.info({
                path:request.route.path, 
                method: request.route.method, 
                fingerprint: request.route.fingerprint, 
                code: response.statusCode,
                payload: response.payload
            });
        }

        //TODO get and check expiration of token
        const tokenIsAlmostExpired = false;
        if (tokenIsAlmostExpired) {
            const tokenPayload = {
                //get payload same as when logging in
            };

            const token = jwt.sign(tokenPayload, request.server.app.jwtKey, {expiresIn: request.server.app.jwtValidTimespan});
            request.response.header("Authorization", `Bearer ${token}`);
        }

        await reply.continue();
    }
});

if (!module.parent) {

    const app_file_transport = new (winston.transports.DailyRotateFile)({
        filename: './logs/log',
        datePattern: 'reperio-app-yyyy-MM-dd.',
        prepend: true,
        level: Config.log_level,
        humanReadableUnhandledException: true,
        handleExceptions: true,
        json: true
    });

    const trace_file_transport = new (winston.transports.DailyRotateFile)({
        filename: './logs/log',
        datePattern: 'reperio-trace-yyyy-MM-dd.',
        prepend: true,
        level: Config.log_level,
        humanReadableUnhandledException: true,
        handleExceptions: true,
        json: true
    });

    const console_transport = new (winston.transports.Console)({
        prepend: true,
        level: Config.log_level,
        humanReadableUnhandledException: true,
        handleExceptions: true,
        json: false,
        colorize: true
    });

    const app_logger = new (winston.Logger)({
        transports: [
          app_file_transport,
          console_transport
        ]
    });

    const trace_logger = new (winston.Logger)({
        transports: [
          trace_file_transport,
          console_transport
        ]
    });

    server.app.logger = app_logger;
    server.app.trace_logger = trace_logger;

    server.start(err => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
} else {
    const console_transport = new (winston.transports.Console)({
        prepend: true,
        level: Config.log_level,
        humanReadableUnhandledException: true,
        handleExceptions: true,
        json: false,
        colorize: true
    });

    const test_logger = new (winston.Logger)({
        transports: [
          //console_transport //uncomment to debug unit tests
        ]
    });
    server.app.logger = test_logger; //logging stubs for execution when testing
    server.app.trace_logger = test_logger;
}


module.exports = server;
