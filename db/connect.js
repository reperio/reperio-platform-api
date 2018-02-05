const Knex = require('knex');
const Model = require('objection').Model;

const env = process.env.NODE_ENV || 'development';
const knexConfig = require('./knexfile')[env];

const knex = Knex(knexConfig);

Model.knex(knex);

module.exports = {
    knex: knex,
    Model: Model
};
