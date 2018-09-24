exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('userRoles').del()
    .then(function () {
        // Inserts seed entries
        return knex('userRoles').insert([
            {
                roleId: 'e37c87b4-b92e-11e8-96f8-529269fb1459',
                userId: 'd08a1f76-7c4a-4dd9-a377-83ffffa752f4'
            }
        ]);
    });
};