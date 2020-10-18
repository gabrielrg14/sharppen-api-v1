const config = require('../knexfile.js')
const env = process.env.DB_ENV || 'development'
const knex = require('knex')(config[env])



// knex.migrate.latest([config])
module.exports = knex