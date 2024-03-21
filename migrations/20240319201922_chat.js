exports.up = function (knex) {
  return knex.schema.createTable("chat", function (table) {
    table.increments("id");
    table.string("messages", 255).notNullable();
    table.integer("users_id").unsigned();
    table.integer("rooms_id").unsigned();
    table.string("color", 255).notNullable();
    table.foreign("rooms_id").references("rooms.id");
    table.foreign("users_id").references("user.id");
    table.timestamps(true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};

exports.config = { transaction: false };
