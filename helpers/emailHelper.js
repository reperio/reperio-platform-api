const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const sgMail = require('@sendgrid/mail')

class EmailHelper {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;

        const transporterOptions = {
            host: this.config.email.smtpHost,
            port: parseInt(this.config.email.smtpPort),
            secure: parseInt(this.config.email.smtpPort) === 465 ? true : false, // true for 465, false for other ports
            tls: {
                rejectUnauthorized: this.config.email.rejectUnauthorizedTLS
            }
        };

        // create smtp transporter object
        this.transporter = nodemailer.createTransport(transporterOptions);

        sgMail.setApiKey(this.config.email.sendGridApiKey);
    }

    async sendEmail(message) {
        if (this.config.email.method === 'smtp') {
            await this.sendSMTPEmail(message);
        } else if (this.config.email.method === 'sendgrid') {
            await this.sendSendGridEmail(message);
        } else {
            this.logger.error(`invalid email method "${this.config.email.method}", must be either "smtp" or "sendgrid"`);
            this.logger.error('unable to send email');
        }
    }

    async sendSendGridEmail(message) {
        const template = await this.loadTemplate(message.type);
        const formattedTemplate = await this.formatHtml(template, message);

        const msg = {
            to: message.to,
            from: this.config.email.sender,
            subject: message.subject,
            text: message.contents,
            html: formattedTemplate
        };

        this.logger.debug(msg);

        await sgMail.send(msg);
    }

    async sendSMTPEmail(message) {
        return new Promise(async (resolve, reject) => {
            const template = await this.loadTemplate(message.type);
            const formattedTemplate = await this.formatHtml(template, message);

            let mailOptions = {
                from: this.config.email.sender,
                to: message.to,
                subject: message.subject,
                text: message.contents,
                html: formattedTemplate
            };

            this.logger.debug(mailOptions);
    
            // send mail with defined transport object
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    this.logger.error(error);
                    this.logger.error(info);
                    reject(error);
                } else {
                    this.logger.debug(info);
                    resolve();
                }
            });
        });
    }

    // read the email template from the file
    async loadTemplate(type) {
        return new Promise((resolve, reject) => {
            const template = this.getTemplate(type);
            fs.readFile(path.join('templates', template), (err, data) => {
                if (err) {
                    reject(err);
                }

                resolve('' + data);
            });
        });
    }

    getTemplate(type) {
        switch (type) {
            case 'email':
                return 'email.html'
            default:
                return '';
        }
    }

    async formatHtml(template, message) {
        try {
            this.logger.info('formatting email template html');
            let from = message.from;
        
            let newTemplate = template.replace('{{bar}}', this.getBarText());
            newTemplate = newTemplate.replace('{{from}}', from);
            newTemplate = newTemplate.replace('{{contents}}', message.contents);
            newTemplate = newTemplate.replace('{{date}}', message.receivedAt.format('MM/DD/YYYY hh:mm a z'));

            if (message.media && message.media.length > 0) {
                this.logger.info('adding media entries to email');
                let mediaHtml = '';
                for (let i = 0; i < message.media.length; i++) {
                    mediaHtml += await this.getImageText(message.media[i]);
                    this.logger.info(`processed ${message.media[i].fileName}`);
                }
                
                newTemplate = newTemplate.replace('{{media}}', mediaHtml);
            } else {
                newTemplate = newTemplate.replace('{{media}}', '');
            }

            this.logger.info('email formatted');
            return newTemplate;
        } catch (err) {
            this.logger.error('failed to format template');
            this.logger.error(err);
            throw err;
        }
    }

    async getImageText(media) {
        return media.isImage ? `<img style="max-width: 100%; margin-left: auto; margin-right: auto;" src="cid:${media.fileName}" alt="${media.fileName}" />\n` : '';
    }

    getBarText() {
        return `<img style="max-width:100%; max-height:100%;" src="${this.config.email.barUrl}" alt="reperio-color-bar" />`;
    }
}

module.exports = EmailHelper;