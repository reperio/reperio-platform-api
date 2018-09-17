const moment = require('moment');
const v4 = require('uuid/v4');


exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('permissions').del()
        .then(function () {
            // Inserts seed entries
            return knex('permissions').insert([
                {
                    id: 'd2d6438c-b92e-11e8-96f8-529269fb1459',
                    name: 'TestAdminPermission',
                    displayName: 'Test Admin Permission',
                    description: 'This is a test of an admin user.',
                    isSystemAdminPermission: true,
                    createdDate:  moment().utc().format(),
                    lastEditedDate: moment().utc().format(),
                    deleted: false
                },
                {
                    id: 'd2d654da-b92e-11e8-96f8-529269fb1459',
                    name: 'TestPermission',
                    displayName: 'Test Permission',
                    description: 'This is a test of a regular user.',
                    isSystemAdminPermission: false,
                    createdDate: moment().utc().format(),
                    lastEditedDate: moment().utc().format(),
                    deleted: false
                }
            ]);
        });
};
