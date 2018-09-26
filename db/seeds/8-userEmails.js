exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('emailVerifications').del()
    .then(function () {
      return knex('userEmails').del()
        .then(function () {
            // Inserts seed entries
            return knex('userEmails').insert([
                {
                    id: 'a0ae75a5-72fe-429b-b3a4-37701c48ff63',
                    userId: 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4',
                    email: 'admin@reper.io',
                    emailVerified: false,
                    deleted: false
                }
            ]);
        });
    });
};