
exports.up = function(knex) {
    return knex.schema.createTable('comentario_postagem', table => {
        table.increments('id').primary()
        table.integer('id_comentario_origem').references('id')
            .inTable('comentario_postagem')
        table.integer('id_postagem').references('id')
            .inTable('faculdade_postagem').notNull()
        table.integer('id_vestibulando').references('id')
            .inTable('vestibulando').notNull()
        table.integer('id_faculdade').references('id')
            .inTable('faculdade').notNull()
        table.binary('conteudo').notNull()
        table.string('tipo_usuario').notNull()
        table.datetime('data_comentario').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('comentario_postagem')
};
