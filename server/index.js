'use strict';

const Config = require('./config');
const Hapi = require('hapi');
const moment = require("moment");
const jwt = require("jsonwebtoken");

const winston = require('winston');
require('winston-daily-rotate-file');

var file_transport = new (winston.transports.DailyRotateFile)({
    filename: './logs/log',
    datePattern: 'reperio-yyyy-MM-dd.',
    prepend: true,
    level: Config.log_level,
    humanReadableUnhandledException: true,
    handleExceptions: true,
    json: true
});

var console_transport = new (winston.transports.Console)({
    prepend: true,
    level: Config.log_level,
    humanReadableUnhandledException: true,
    handleExceptions: true,
    json: false,
    colorize: true
});

var logger = new (winston.Logger)({
    transports: [
      file_transport,
      console_transport
    ]
});

const UoW = require("../db/unitOfWork");

// Create a server with a host and port
const server = new Hapi.Server({
    debug: {
        request: ["error"]
    }
});
server.connection({
    host: '0.0.0.0',
    port: 8000
});

server.app.jwtKey = "f49b26e0-cdf1-4dc3-8379-de07b32b13c9";
server.app.jwtValidTimespan = 3600;

server.app.logger = logger;

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

server.ext({
    type: "onRequest",
    method: async (request, reply) => {
        request.app.uows = [];
        request.app.getNewUoW = async (createTransaction = true) => {
            const uow = new UoW();
            if (createTransaction) {
                await uow.begin();
            }
            request.app.uows.push(uow);
            return uow;
        };

        await reply.continue();
    }
});

server.ext({
    type: "onPostAuth",
    method: async (request, reply) => {
        if (request.auth.isAuthenticated) {
            const uow = await request.app.getNewUoW(false);

            request.app.loggedInUser = await uow.usersRepository.getUserByIdWithRoles(request.auth.credentials.loggedInUser.id);
            request.app.currentUser = await uow.usersRepository.getUserByIdWithRoles(request.auth.credentials.currentUser.id);
            request.app.currentSubscriber = await uow.subscribersRepository.getSubscriberById(request.auth.credentials.currentSubscriber.id);
        }
        reply.continue();
    }
});

server.ext({
    type: "onPostHandler",
    method: async (request, reply) => {
        for (const uow of request.app.uows) {
            if (uow.inTransaction) {
                console.log("Auto transaction rollback");
                await uow.rollback();
            }
        }
        reply.continue();
    }
});

server.ext({
    type: "onPreResponse",
    method: async (request, reply) => {
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


server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
