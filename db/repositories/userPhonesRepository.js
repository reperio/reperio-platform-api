class UserPhonesRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUserPhone(userId, phoneNumber, phoneType) {
        const payload = {
            userId,
            number: phoneNumber,
            phoneType: phoneType,
            numberVerified: false,
            deleted: false
        }
        try {
            const existingUserPhone = await this.uow._models.UserPhone
                .query(this.uow._transaction)
                .where('number', phoneNumber)
                .first();

            if (existingUserPhone.userId === userId  || existingUserPhone.userId == null) {
                return await this.uow._models.UserPhone
                    .query(this.uow._transaction)
                    .patch({deleted: false, userId, phoneType, numberVerified: false})
                    .where('id', existingUserPhone.id)
                    .returning("*")
                    .first();
            }

            return await this.uow._models.UserPhone
                .query(this.uow._transaction)
                .insertAndFetch(payload);
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user phone`);
            throw err;
        }
    }
}

module.exports = UserPhonesRepository;