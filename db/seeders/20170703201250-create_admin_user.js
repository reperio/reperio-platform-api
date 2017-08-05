'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            

            const userInsertQuery = await queryInterface.bulkInsert("users", [
                {
                    username: "admin",
                    password: "$2a$12$GsuXWK4R0KpBNExCd7DOwe11O./O46D6jp7LvhMzR.nXIbF0xcArq", // hash for "password" (without quotes)
                    first_name: "Admin",
                    last_name: "User",
                    email: "admin_user@test.com",
                    is_active: true,
                    last_login_date: null
                }
            ], {
                returning: true,
                transaction: transaction
            });

            transaction.commit();
        } catch (e) {
            transaction.rollback();
            throw e;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkDelete('users', null, { transaction: transaction });
            transaction.commit();
        } catch (e) {
            transaction.rollback();
            throw e;
        }
    }
};
