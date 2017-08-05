'use strict';

const db = require('./../models');

module.exports = {
    up: function(migration, DataTypes, done) {
        db.sequelize
            .sync({force:true})
            .then(done);
    },

    down: function(migration, DataTypes, done) {
        migration
            .dropAllTables()
            .then(done);
    }
};