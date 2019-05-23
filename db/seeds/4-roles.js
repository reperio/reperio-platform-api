exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('roles').del() 
    // Inserts seed entries
    await knex('roles').insert([
        {
            id: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            name: 'Core Super Admin',
            deleted: false,
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
        }, 
        {
            id: 'e37c87b4-b92e-11e8-96f8-529269fb1450',
            name: 'Inactive Role',
            deleted: true,
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
        },
        {
            id: 'e37c87b4-b92e-11e8-96f8-529269fb1451',
            name: 'Organization Admin',
            deleted: false,
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
        }
    ]);
};