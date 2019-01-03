class UserPhonesRepository {
    constructor(uow) {
        this.uow = uow;
    }

    async createUserPhone(userId, phoneNumber, phoneType) {
        const userPhoneModel = {
            userId: userId,
            number: phoneNumber,
            phoneType: phoneType,
            numberVerified: false,
            deleted: false
        };

        try {
            return await this.uow._models.UserPhone
                .query(this.uow._transaction)
                .insert(userPhoneModel)
                .returning("*");
        } catch (err) {
            this.uow._logger.error(err);
            this.uow._logger.error(`Failed to create user phone`);
            throw err;
        }
    }
}

module.exports = UserPhonesRepository;