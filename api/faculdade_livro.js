module.exports = app => {

    const { existsOrError } = app.api.validation

    const saveLivro = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Faculdade não informada!')
        }

        faculdade_livro = { ...req.body }
        faculdade_livro.id_faculdade = req.params.id

        try {
            existsOrError(faculdade_livro.nome_livro, 'Nome do livro não informado.')
            existsOrError(faculdade_livro.autor_livro, 'Autor do livro não informado.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: faculdade_livro.id_faculdade }).first()

        if(faculdadeFromDB) {
            app.db('faculdade_livro')
                .insert(faculdade_livro)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Faculdade não encontrada.')
        }
    }

    const updateLivro = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Ocorreu um erro!')
        }

        const faculdade_livro = { ...req.body }

        try {
            existsOrError(faculdade_livro.nome_livro, 'Nome do livro não informado.')
            existsOrError(faculdade_livro.autor_livro, 'Autor do livro não informado.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(req.params.id) {
            app.db('faculdade_livro')
                .update(faculdade_livro)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const getLivrosByIdFaculdade = async (req, res) => {
        app.db('faculdade_livro')
            .select('id', 'id_faculdade', 'nome_livro', 'autor_livro')
            .where({ id_faculdade: req.params.id })
            .then(livros => res.json(livros))
            .catch(err => res.status(500).send(err))
    }

    const getLivroById = (req, res) => {
        app.db('faculdade_livro')
            .select('id', 'id_faculdade', 'nome_livro', 'autor_livro')
            .where({ id: req.params.id })
            .first()
            .then(livro => res.json(livro))
            .catch(err => res.status(500).send(err))
    }
    
    const getLivrosOfFollowingFaculdades = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Vestibulando não informado!')
        }

        app.db('vestibulando_faculdade')
            .select('id_faculdade')
            .where({ id_vestibulando: req.params.id })
            .then(ids_following => {
                Promise.all(ids_following.map(following => {
                    return app.db('faculdade')
                        .select('id', 'nome', 'email', 'data_prova', 'telefone', 'endereco', 'path_imagem', 'ativo')
                        .where({ id: following.id_faculdade, ativo: true })
                        .first()
                        .then(followingData => {
                            return followingData
                        })
                })).then(faculdades => {
                        Promise.all(faculdades.map(faculdade => {
                            return app.db('faculdade_livro')
                                .select('id', 'id_faculdade', 'nome_livro', 'autor_livro')
                                .where({ id_faculdade: faculdade.id })
                                .then(livrosFaculdade => {
                                    livrosFaculdade.forEach(livro => {
                                        livro.nome_faculdade = faculdade.nome
                                    })
                                    return livrosFaculdade
                                })
                        })).then(livrosFaculdade => {
                            res.json(livrosFaculdade)
                        })
                    })
                })

    }

    const deleteLivro = async (req, res) => {
        try {
            const rowsDeleted = await app.db('faculdade_livro')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(rowsDeleted, 'Livro não encontrado.')
            } catch(msg) {
                return res.status(400).send(msg)    
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }
    }

    return { saveLivro, updateLivro, getLivrosByIdFaculdade, getLivroById, getLivrosOfFollowingFaculdades, deleteLivro }

}