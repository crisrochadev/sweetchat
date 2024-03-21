// Update with your config settings.
require('dotenv').config()

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: process.env.CLIENT_DEV,
    connection: {
      user:process.env.USER_DEV,
      password:process.env.PASSWORD_DEV,
      host:process.env.HOST_DEV,
      port:process.env.PORT_DB_DEV,
      database:process.env.DATABASE_DEV
    },
    allowNull:true
  },

 

  production: {
    client: process.env.CLIENT,
    connection: {
      user:process.env.USER,
      password:process.env.PASSWORD,
      host:process.env.HOST,
      port:process.env.PORT_DB,
      database:process.env.DATABASE
    },
    allowNull:true
  }

};
