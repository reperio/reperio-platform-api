const moment = require('moment');

exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('userOrganizations').del()
    await knex('userRoles').del()
    await knex('roleApplicationPermissions').del()
    await knex('rolePermissions').del()
    await knex('roles').del()
    await knex('organizations').del()
    return knex('organizations').insert([
        {
            id: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
            name: 'Test Organization',
            personal: true,
            deleted: false
        }
    ]);
};