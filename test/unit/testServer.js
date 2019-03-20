const Boom = require('boom');
const {registerAPIPlugin} = require('../../extensions');
const Server = require('@reperio/hapijs-starter');
const {getApplicationList} = require('../../db');

const jsonSecret = '496d7e4d-eb86-4706-843b-5ede72fad0e8';
const adminAuthHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50VXNlcklkIjoiZDA4YTFmNzYtN2M0YS00ZGQ5LWEzNzctODNmZmZmYTc1MmY0IiwidXNlcklkIjoiZDA4YTFmNzYtN2M0YS00ZGQ5LWEzNzctODNmZmZmYTc1MmY0IiwidXNlckVtYWlsIjoic3VwcG9ydEByZXBlci5pbyIsInVzZXJQZXJtaXNzaW9ucyI6WyJWaWV3VXNlcnMiLCJDcmVhdGVVc2VycyIsIkRlbGV0ZVVzZXJzIiwiTWFuYWdlVXNlck9yZ2FuaXphdGlvbnMiLCJNYW5hZ2VVc2VyUm9sZXMiLCJBZGRFbWFpbCIsIlNldFByaW1hcnlFbWFpbCIsIkRlbGV0ZUVtYWlsIiwiVmlld1JvbGVzIiwiQ3JlYXRlUm9sZXMiLCJVcGRhdGVSb2xlcyIsIkRlbGV0ZVJvbGVzIiwiVmlld09yZ2FuaXphdGlvbnMiLCJDcmVhdGVPcmdhbml6YXRpb25zIiwiVXBkYXRlT3JnYW5pemF0aW9ucyIsIkRlbGV0ZU9yZ2FuaXphdGlvbnMiLCJWaWV3UGVybWlzc2lvbnMiLCJVcGRhdGVQZXJtaXNzaW9ucyIsIlVwZGF0ZUJhc2ljVXNlckluZm8iLCJSZXNlbmRWZXJpZmljYXRpb25FbWFpbHMiXSwiaWF0IjoxNTQzMjUyNjQwLCJleHAiOjMzMTAwODUyNjQwfQ.fCOaMqGoe4butY4J4KbWrni4v9oJFNy7fGo0S4Fworc';
const noPermissionsAuthHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXJyZW50VXNlcklkIjoiNjBhNTE0MjUtODI3Zi00YjExLThhMTAtMDE0Y2I1MDU5NWUzIiwidXNlclBlcm1pc3Npb25zIjpbXSwiaWF0IjoxNTQzODg4MDc4LCJleHAiOjE1NDM5MzEyNzh9.jAkF9LqP2z5XmFADwKyyqyGny_mACc5igDFXckUY53c';

const createTestServer = async function() {
    const server = new Server({
        statusMonitor: false,
        cors: true,
        corsOrigins: ['*'],
        authEnabled: true,
        authSecret: jsonSecret,
        testMode: true,
        logDefaultConsoleTransport: false
    });
    
    server.server.app.config = {
        jsonSecret: jsonSecret,
        jwtValidTimespan: '12h',
        email: {
            sender: 'fakeSender@reper.io'
        }
    };

    server.server.auth.scheme('application', function (server, options) {
        return {
            authenticate: async function (request, h) {
                const headers = request.headers;

                if (!headers['application-token']) {
                    return h.unauthenticated(Boom.unauthorized('Missing application token'));
                }

                const apps = {'test': {}};
                const verifiedApplication = apps[headers['application-token']];
                if (!verifiedApplication) {
                    return h.unauthenticated(Boom.unauthorized('Invalid application token'));
                }

                h.authenticated({
                    credentials: {
                        currentApplication: verifiedApplication
                    }
                });
                return h.continue;
            }
        }
    })
    server.server.auth.strategy('application-token', 'application')

    await registerAPIPlugin(server);
    
    // replace all loggers
    server.server.app.logger = {
        debug: () => {return;},
        info: () => {return;},
        warn: () => {return;},
        error: () => {return;},
    };
    
    server.server.app.traceLogger = {
        debug: () => {return;},
        info: () => {return;},
        warn: () => {return;},
        error: () => {return;}
    };
    
    server.server.app.activityLogger = {
        debug: () => {return;},
        info: () => {return;},
        warn: () => {return;},
        error: () => {return;}
    };

    return server;
};

module.exports = {createTestServer, adminAuthHeader, noPermissionsAuthHeader};
