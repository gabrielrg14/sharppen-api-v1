
exports.up = function(knex) {
    return knex.schema.createTable('vestibulando', table => {
        table.increments('id').primary()
        table.string('nome').notNull()
        table.string('email').notNull().unique()
        table.string('senha').notNull()
        table.date('data_nascimento').notNull()
        table.string('curso').notNull()
        table.string('path_imagem', 1000).defaultTo(null)
        table.boolean('ativo').notNull().defaultTo(true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('vestibulando')
};
