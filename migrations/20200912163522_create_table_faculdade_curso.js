
exports.up = function(knex) {
    return knex.schema.createTable('faculdade_curso', table => {
        table.increments('id').primary()
        table.integer('id_faculdade').references('id')
            .inTable('faculdade').notNull()
        table.string('nome_curso').notNull()
        table.string('periodo').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('faculdade_curso')
};
