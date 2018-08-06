const moment = require('moment');


exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('users').del()
        .then(function () {
            // Inserts seed entries
            return knex('users').insert([
                {
                    id: 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                    firstName: 'admin',
                    lastName: 'user',
                    primaryEmail: 'admin@reper.io',
                    primaryEmailVerified: true,
                    password: '$2a$12$pRM5xSQ5MQp7R8gy9..TBe.x1ZyBcWRSIrPMT5UqboatLi3gaDZUe',
                    disabled: false,
                    deleted: false
                }
            ]);
        });
};
