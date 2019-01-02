exports.seed = async function(knex, Promise) {
    // Deletes ALL existing entries
    await knex('applicationOrganizations').del();
    await knex('applications').del();

    // Inserts seed entries
    await knex('applications').insert([
        {
            id: '2ce36838-27ae-4c00-b754-e2db7b61c577',
            name: 'Managed IT Services',
            apiUrl: 'http://localhost:3002/api/v1',
            clientUrl: 'http://localhost:8082',
            secretKey: 'f3356c2d6619aaf57be43f69baccd3e871f37dad9e57d6b705c50501085e0cb3f961ec43f67da13a9a186c378ac55710'
        }
    ]);

    await knex('applicationOrganizations').insert([
        {
            applicationId: '2ce36838-27ae-4c00-b754-e2db7b61c577',
            organizationId: '966f4157-934c-45e7-9f44-b1e5fd8b79a7',
            active: true
        }
    ]);
}