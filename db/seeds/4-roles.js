const moment = require('moment');
const v4 = require('uuid/v4');


exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('roles').del()
        .then(function () {
            // Inserts seed entries
            return knex('roles').insert([
                {
                    id: v4(),
                    name: 'test',
                    deleted: false,
                    organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
                },
                {
                  id: v4(),
                  name: 'test2',
                  deleted: false,
                  organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
                }
            ]);
        });
};
