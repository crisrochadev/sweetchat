const knexFile = require("../knexfile");

const knex =  require("knex")(knexFile['prodution']);

module.exports = knex;