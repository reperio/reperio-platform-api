exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('roles').del() 
    // Inserts seed entries
    await knex('roles').insert([
        {
            id: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
            name: 'Admin Role Test',
            deleted: false,
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
        },
        {
            id: 'e37c8e4e-b92e-11e8-96f8-529269fb1459',
            name: 'Regular Role Test',
            deleted: false,
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7'
        }
    ]);
};