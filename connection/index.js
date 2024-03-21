const knexFile = require("../knexfile");

const knex =  require("knex")(knexFile['production']);

module.exports = knex;