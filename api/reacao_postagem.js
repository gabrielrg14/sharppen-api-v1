module.exports = app => {

    const { existsOrError } = app.api.validation

    const reactUnreactPost = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        }

        reacao_postagem = { ...req.body }
        reacao_postagem.id_postagem = req.params.id

        try {
            existsOrError(reacao_postagem.id_vestibulando, 'Vestibulando não informado!')
            existsOrError(reacao_postagem.id_faculdade, 'Faculdade não informada!')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        const postagemFromDB = await app.db('faculdade_postagem')
        .where({ 
                id: reacao_postagem.id_postagem,
                id_faculdade: reacao_postagem.id_faculdade 
            }).first()

        if(!postagemFromDB) {
            return res.status(400).send('Postagem não encontrada.')
        }

        const faculdadeFromDB = await app.db('faculdade')
        .where({ id: reacao_postagem.id_faculdade }).first()
        
        if(!faculdadeFromDB) {
            return res.status(400).send('Faculdade não encontrada.')
        }

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: reacao_postagem.id_vestibulando }).first()

        if(!vestibulandoFromDB) {
            return res.status(400).send('Vestibulando não encontrado.')
        }

        if(faculdadeFromDB && postagemFromDB && vestibulandoFromDB) {
            const reacaoPostagemFromDB = await app.db('reacao_postagem')
                .select('id')
                .where({ 
                    id_postagem: reacao_postagem.id_postagem, 
                    id_vestibulando: reacao_postagem.id_vestibulando 
                }).first()

            if(reacaoPostagemFromDB) {
                try {
                    const rowsDeleted = await app.db('reacao_postagem')
                        .where({ 
                                id_postagem: reacao_postagem.id_postagem,
                                id_vestibulando: reacao_postagem.id_vestibulando,
                                id_faculdade: reacao_postagem.id_faculdade
                            }).del()
                    
                    try {
                        existsOrError(rowsDeleted, 'Registro da reação não encontrado.')
                    } catch(msg) {
                        return res.status(400).send(msg)    
                    }
        
                    res.status(204).send()
                } catch(msg) {
                    res.status(500).send(msg)
                }
            } else {
                reacao_postagem.data_reacao = new Date().toISOString();

                app.db('reacao_postagem')
                    .insert(reacao_postagem)
                    .then(_ => {
                        app.db('reacao_postagem')
                            .count('id_postagem')
                            .where({ id_postagem: reacao_postagem.id_postagem })
                            .first()
                            .then(reactions => res.json(reactions.count))
                            .catch(err => res.status(500).send(err))
                    })
                    .catch(err => res.status(500).send(err))
            }
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }

    }

    const getNumberOfReactions = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        } else {
            app.db('reacao_postagem')
                .count('id_postagem')
                .where({ id_postagem: req.params.id })
                .first()
                .then(reactions => res.json(reactions.count))
                .catch(err => res.status(500).send(err))
        }

    }

    const getReactorsByIdPost = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        } else {
            app.db('reacao_postagem')
                .select('id_vestibulando')
                .where({ id_postagem: req.params.id })
                .then(ids_vestibulandos => {
                    Promise.all(ids_vestibulandos.map(vestibulando => {
                        return app.db('vestibulando')
                            .select('id', 'nome', 'email', 'data_nascimento', 'curso', 'path_imagem', 'ativo')
                            .where({ id: vestibulando.id_vestibulando })
                            .first()
                            .then(vestibulandoData => vestibulandoData)
                    })).then(vestibulandos => {
                        res.json(vestibulandos);
                    });
                })
                .catch(err => res.status(500).send(err))
        }


    }

    const checkReactedPost = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        }

        reacao_postagem = { ...req.body }
        reacao_postagem.id_postagem = req.params.id

        try {
            existsOrError(reacao_postagem.id_vestibulando, 'Vestibulando não informado!')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        const postagemFromDB = await app.db('faculdade_postagem')
            .where(
                { id: reacao_postagem.id_postagem }
            ).first()

        if(!postagemFromDB) {
            return res.status(400).send('Postagem não encontrada.')
        }

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: reacao_postagem.id_vestibulando }).first()

        if(!vestibulandoFromDB) {
            return res.status(400).send('Vestibulando não encontrado.')
        }

        if(postagemFromDB && vestibulandoFromDB) {
            rowsFound = await app.db('reacao_postagem')
                .select('id', 'id_postagem', 'id_vestibulando')
                    .where(
                        {
                            id_postagem: reacao_postagem.id_postagem, 
                            id_vestibulando: reacao_postagem.id_vestibulando 
                        }
                    )
                    .first()
            
            if(rowsFound) {
                res.json(true)
            } else {
                res.json(false)
            }
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }

    }

    return { reactUnreactPost, getNumberOfReactions, getReactorsByIdPost, checkReactedPost }

}