exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('userOrganizations').del()
    // Inserts seed entries
    await knex('userOrganizations').insert([
        {
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
            userId: 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4'
        }
    ]);
};