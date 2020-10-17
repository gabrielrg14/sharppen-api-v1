
exports.up = function(knex) {
    return knex.schema.createTable('vestibulando_faculdade', table => {
        table.increments('id').primary()
        table.integer('id_vestibulando').references('id')
            .inTable('vestibulando').notNull()
        table.integer('id_faculdade').references('id')
            .inTable('faculdade').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('vestibulando_faculdade')
};
