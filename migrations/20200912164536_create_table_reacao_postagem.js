
exports.up = function(knex) {
    return knex.schema.createTable('reacao_postagem', table => {
        table.increments('id').primary()
        table.integer('id_postagem').references('id')
            .inTable('faculdade_postagem').notNull()
        table.integer('id_vestibulando').references('id')
            .inTable('vestibulando').notNull()
        table.integer('id_faculdade').references('id')
            .inTable('faculdade').notNull()
        table.datetime('data_reacao').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('reacao_postagem')
};
