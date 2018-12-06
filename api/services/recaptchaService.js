const request = require('request-promise-native');

class RecaptchaService {
    async siteVerify(secret, response, remoteip) {
        const url = 'https://www.google.com/recaptcha/api/siteverify';
        const options = {
            uri: `${url}?secret=${secret}&response=${response}&remoteip=${remoteip}`,
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

const recaptchaService = new RecaptchaService();

module.exports = recaptchaService;
