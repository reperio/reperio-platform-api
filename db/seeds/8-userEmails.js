exports.seed = async function (knex, Promise) {
  // Deletes ALL existing entries
    await knex('emailVerifications').del()
    await knex('forgotPasswords').del()
    await knex('userEmails').del()
    // Inserts seed entries
    await knex('userEmails').insert([
        {
            id: 'a0ae75a5-72fe-429b-b3a4-37701c48ff63',
            userId: 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4',
            email: 'support@reper.io',
            emailVerified: true,
            deleted: false
        }
    ]);
    await knex('users')
        .where('id', '=', 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4')
        .update({
            primaryEmailId: 'a0ae75a5-72fe-429b-b3a4-37701c48ff63',
            primaryEmailAddress: 'support@reper.io'
    });
};