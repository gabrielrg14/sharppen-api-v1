
exports.up = function(knex) {
    return knex.schema.createTable('vestibulando_rotina', table => {
        table.increments('id').primary()
        table.integer('id_vestibulando').references('id')
            .inTable('vestibulando').notNull()
        table.string('segunda_feira').defaultTo("")
        table.string('terca_feira').defaultTo("")
        table.string('quarta_feira').defaultTo("")
        table.string('quinta_feira').defaultTo("")
        table.string('sexta_feira').defaultTo("")
        table.string('sabado').defaultTo("")
        table.string('domingo').defaultTo("")
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('vestibulando_rotina')
};
