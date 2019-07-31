const moment = require('moment');

exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('userRoles').del()
    await knex('rolePermissions').del()
    await knex('roles').del()
    await knex('applicationOrganizations').del()
    await knex('applications').del()
    await knex('organizationAddresses').del()
    await knex('organizations').del()
    await knex('organizations').insert([
        {
            id: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
            name: 'Test Organization',
            personal: true,
            deleted: false
        }
    ])
    return knex('organizationAddresses').insert([
        {
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
            streetAddress: "123 street",
            suiteNumber: "SUITE 123",
            city: "city",
            state: "state",
            zip: "12345",
            deleted: false
        }
    ]);
};