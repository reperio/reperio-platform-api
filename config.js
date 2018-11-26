module.exports = {
    jsonSecret: process.env.CORE_JSON_SECRET || '496d7e4d-eb86-4706-843b-5ede72fad0e8',
    jwtValidTimespan: process.env.CORE_JWT_TIMESPAN || '12h',
    secret: process.env.CORE_SECRET || '6LfjumIUAAAAAI33bLW6by3Ny3QOE50YxvW_05q3',
    localTimezone: process.env.CORE_TIMEZONE || 'America/New_York',
    webAppUrl: process.env.CORE_APP_URL || 'http://localhost:8080',
    limitEnabled: process.env.LIMIT_ENABLED || true,
    //number of total requests that can be made on a given path per period. Set to false to disable limiting requests per path.
    limitPath: process.env.LIMIT_PATH || 50,
    //number of total requests a user can make per period. Set to false to disable limiting requests per user.
    limitUser: process.env.LIMIT_USER || 300,
    trustProxy: process.env.LIMIT_TRUST_PROXY || false,
    headers: process.env.LIMIT_HEADERS || false,
    ipWhitelist: process.env.LIMIT_IP_WHITELIST || ["127.0.0.1"],
    pathCache: {
        expiresIn: process.env.LIMIT_USER_CACHE_EXPIRES || 60000
    },
    userPathCache: {
        expiresIn: process.env.LIMIT_USER_PATH_CACHE_EXPIRES || 60000
    },
    email: {
        smtpHost: process.env.CORE_SMTP_HOST || 'localhost',
        smtpPort: process.env.CORE_SMTP_PORT || 25,
        smtpUser: process.env.CORE_SMTP_USER || '',
        smtpPassword: process.env.CORE_SMTP_USER_PASSWORD || '',
        sender: process.env.CORE_EMAIL_SENDER || 'do-not-reply@reper.io',
        sendGridApiKey: process.env.CORE_SENDGRID_API_KEY || '',
        method: process.env.CORE_EMAIL_METHOD || 'smtp', // must be either 'smtp' or 'sendgrid',
        rejectUnauthorizedTLS: process.env.CORE_SMTP_REJECT_UNAUTHORIZED_TLS || true,
        barUrl: process.env.CORE_BAR_URL || '',
        linkTimeout: process.env.CORE_LINK_TIMEOUT || 10
    },
    redisOtpExpirationSeconds: process.env.REDIS_OTP_EXPIRATION_SECONDS || 60
};