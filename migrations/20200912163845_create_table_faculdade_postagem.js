
exports.up = function(knex) {
    return knex.schema.createTable('faculdade_postagem', table => {
        table.increments('id').primary()
        table.integer('id_faculdade').references('id')
            .inTable('faculdade').notNull()
        table.binary('conteudo').notNull()
        table.datetime('data_postagem').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('faculdade_postagem')
};
