
exports.up = function(knex) {
    return knex.schema.createTable('faculdade_livro', table => {
        table.increments('id').primary()
        table.integer('id_faculdade').references('id')
            .inTable('faculdade').notNull()
        table.string('nome_livro').notNull()
        table.string('autor_livro').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('faculdade_livro')
};
