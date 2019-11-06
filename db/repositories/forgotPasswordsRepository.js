const moment = require('moment');

class ForgotPasswordsRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async addEntry(userId) {
        const payload = {
           createdAt: moment.utc().format(),
           userId
        }
        try {
            return await this.uow._models.ForgotPassword
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create forgot password`);
            throw err;
        }
    }

    async getEntry(forgotPasswordId) {
        try {
            return await this.uow._models.ForgotPassword
                .query(this.uow._transaction)
                .where('id', forgotPasswordId)
                .first();
        } catch (err) {
            this.uow._logger.error(`Failed to fetch forgot password using id: ${forgotPasswordId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }

    async trigger(forgotPasswordId, now) {
        try {
            return await this.uow._models.ForgotPassword
                .query(this.uow._transaction)
                .patch({triggeredAt: now})
                .where('id', forgotPasswordId);
        } catch (err) {
            this.uow._logger.error(`Failed to trigger forgot password: ${forgotPasswordId}`);
            this.uow._logger.error(err);
            throw err;
        }
    }
}

module.exports = ForgotPasswordsRepository;