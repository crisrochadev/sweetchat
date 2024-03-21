exports.up = function (knex) {
  return knex.schema
    .createTable('rooms', function (table) {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.integer('qtd').notNullable();
      table.string('qtd_use', 255);
      table.timestamps(true)
    })
};

exports.down = function (knex) {
  return knex.schema.dropTable('rooms')
};

exports.config = { transaction: false };