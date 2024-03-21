exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id");
    table.string("name", 255).notNullable();
    table.string("color", 255).notNullable();
    table.integer("rooms_id").unsigned();
    table.foreign("rooms_id").references("rooms.id");
    table.timestamps(true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};

exports.config = { transaction: false };
