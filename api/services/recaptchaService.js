const request = require('request-promise-native');

class RecaptchaService {

    constructor (url, logger) {
        this.url = url;
        this.logger = logger;
    }

    async siteVerify(secret, response, remoteip) {
        const payload = {secret, response, remoteip}
        const options = {
            uri: `${this.url}?secret=${secret}&response=${response}&remoteip=${remoteip}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        };

        try {
            const response = JSON.parse(await request(options));
            return response;
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = RecaptchaService;
