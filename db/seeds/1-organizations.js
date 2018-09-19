const moment = require('moment');


exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    knex('userOrganizations').del()
        .then(function () {
            // Inserts seed entries
            return knex('organizations').del()
            .then(function () {
                // Inserts seed entries
                return knex('organizations').insert([
                    {
                        id: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
                        name: 'Test Organization',
                        personal: true,
                        deleted: false
                    }
                ]);
            });
    });
};
