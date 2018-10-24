const moment = require('moment');

class EmailVerificationsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async addEntry(userEmailId, userId) {
        const payload = {
           createdAt: moment.utc().format(),
           userEmailId,
           userId
        }
        try {
            return await this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create email verification`);
            throw err;
        }
    }

    async getEntry(emailVerificationId) {
        try {
            return await this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .where('id', emailVerificationId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch email verification using id: ${emailVerificationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async trigger(emailVerificationId, now) {
        try {
            return await this.uow._models.EmailVerification
                .query(this.uow._transaction)
                .patch({triggeredAt: now})
                .where('id', emailVerificationId);
        } catch (err) {
            this.uow._logger.error(`Failed to trigger email verification: ${emailVerificationId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = EmailVerificationsRepository;