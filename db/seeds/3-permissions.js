const moment = require('moment');
const v4 = require('uuid/v4');


exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('permissions').del()
        .then(function () {
            // Inserts seed entries
            return knex('permissions').insert([
                {
                    id: v4(),
                    name: 'test',
                    description: 'This is a test.',
                    deleted: false
                },
                {
                    id: v4(),
                    name: 'test2',
                    description: 'This is a second test.',
                    deleted: false
                }
            ]);
        });
};
