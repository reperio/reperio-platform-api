exports.seed = async function (knex, Promise) {
    // Deletes ALL existing entries
    await knex('emailVerifications').del()
    await knex('users')
        .update({
            primaryEmailId: null
    });
    await knex('userEmails')
        .update({
            userId: null
    });
    await knex('users').del();
    await knex('userEmails').del();
    await knex('users').insert([
        {
            id: 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4',
            firstName: 'admin',
            lastName: 'user',
            primaryEmailAddress: null,
            primaryEmailId: null,
            password: '$2a$12$pRM5xSQ5MQp7R8gy9..TBe.x1ZyBcWRSIrPMT5UqboatLi3gaDZUe',
            disabled: false,
            deleted: false
        }
    ]);
};