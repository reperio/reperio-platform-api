'use strict';
const uuid = require('uuid/v4');
module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define('users', {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuid(),
            primaryKey: true
        },

        username: {type: DataTypes.STRING, allowNull: false},
        password: {type: DataTypes.STRING, allowNull: false},
        first_name: {type: DataTypes.STRING, allowNull: false},
        last_name: {type: DataTypes.STRING, allowNull: false},
        email: {type: DataTypes.STRING, allowNull: false},
        is_active: {type: DataTypes.BOOLEAN, allowNull: false},
        last_login_date: DataTypes.DATE
    }, {
        tableName: "users",
        timestamps: false,
        createdAt: true,
        updatedAt: true,
        deletedAt: false,
        freezeTableName: true
    });
    return User;
};