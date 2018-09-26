const moment = require('moment-timezone');
const EmailHelper = require('./emailHelper');

class MessageHelper {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
    }

    async processMessage(message) {
        this.logger.info(`processing message: ${JSON.stringify(message)}`);

        // set the time we received the message
        message.receivedAt = moment().tz(this.config.localTimezone);
        // initialize helpers
        const emailHelper = new EmailHelper(this.logger, this.config);

        // send notification email
        if (message.to === null) {
            this.logger.warn('could not find an email address, skipping notification email');
        } else {
            this.logger.info('sending notification email');
            await emailHelper.sendEmail(message);
            this.logger.info('email sent');
        }

        return message;
    }
}

module.exports = MessageHelper;