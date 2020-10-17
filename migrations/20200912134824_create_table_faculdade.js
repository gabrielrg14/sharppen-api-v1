
exports.up = function(knex) {
    return knex.schema.createTable('faculdade', table => {
        table.increments('id').primary()
        table.string('nome').notNull()
        table.string('email').notNull().unique()
        table.string('senha').notNull()
        table.datetime('data_prova').notNull()
        table.string('telefone').notNull()
        table.string('endereco', 1000).notNull()
        table.string('path_imagem', 1000).defaultTo(null)
        table.boolean('ativo').notNull().defaultTo(true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('faculdade')
};
