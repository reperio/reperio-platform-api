module.exports = {
    jsonSecret: '496d7e4d-eb86-4706-843b-5ede72fad0e8',
    jwtValidTimespan: '12h',
    secret: '6LfjumIUAAAAAI33bLW6by3Ny3QOE50YxvW_05q3',
    localTimezone: 'America/New_York',
    webAppUrl: process.env.CORE_APP_URL || 'http://localhost:8080',
    email: {
        smtpHost: process.env.CORE_SMTP_HOST || 'localhost',
        smtpPort: process.env.CORE_SMTP_PORT || 25,
        smtpUser: process.env.CORE_SMTP_USER || '',
        smtpPassword: process.env.CORE_SMTP_USER_PASSWORD || '',
        sender: process.env.CORE_EMAIL_SENDER || 'do-not-reply@reper.io',
        sendGridApiKey: process.env.CORE_SENDGRID_API_KEY || '',
        method: process.env.CORE_EMAIL_METHOD || 'smtp', // must be either 'smtp' or 'sendgrid',
        rejectUnauthorizedTLS: process.env.CORE_SMTP_REJECT_UNAUTHORIZED_TLS || true,
        barUrl: process.env.CORE_BAR_URL || ''
    }
};