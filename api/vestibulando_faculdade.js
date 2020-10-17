module.exports = app => {

    const { existsOrError, formatDate } = app.api.validation

    const followUnfollowFaculdade = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Vestibulando não informado!')
        }

        vestibulando_faculdade = { ...req.body }
        vestibulando_faculdade.id_vestibulando = req.params.id

        try {
            existsOrError(vestibulando_faculdade.id_faculdade, 'Faculdade não informada!')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: vestibulando_faculdade.id_vestibulando }).first()

        if(!vestibulandoFromDB) {
            return res.status(400).send('Vestibulando não encontrado.')
        }

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: vestibulando_faculdade.id_faculdade }).first()

        if(!faculdadeFromDB) {
            return res.status(400).send('Faculdade não encontrada.')
        }

        if(vestibulandoFromDB && faculdadeFromDB) {
            const vestibulandoFaculdadeFromDB = await app.db('vestibulando_faculdade')
                .select('id')
                .where({ 
                    id_vestibulando: vestibulando_faculdade.id_vestibulando, 
                    id_faculdade: vestibulando_faculdade.id_faculdade
                }).first()

            if(vestibulandoFaculdadeFromDB) {
                try {
                    const rowsDeleted = await app.db('vestibulando_faculdade')
                        .where({ 
                                id_vestibulando: vestibulando_faculdade.id_vestibulando, 
                                id_faculdade: vestibulando_faculdade.id_faculdade
                            }).del()
                    
                    try {
                        existsOrError(rowsDeleted, 'Registro de seguidor não encontrado.')
                    } catch(msg) {
                        return res.status(400).send(msg)    
                    }
        
                    res.status(204).send()
                } catch(msg) {
                    res.status(500).send(msg)
                }
            } else {
                app.db('vestibulando_faculdade')
                    .insert(vestibulando_faculdade)
                    .then(_ => res.status(204).send())
                    .catch(err => res.status(500).send(err))
            }
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }

    }

    const checkFollower = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Vestibulando não informado!')
        }

        vestibulando_faculdade = { ...req.body }
        vestibulando_faculdade.id_vestibulando = req.params.id

        try {
            existsOrError(vestibulando_faculdade.id_faculdade, 'Faculdade não informada!')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: vestibulando_faculdade.id_vestibulando }).first()

        if(!vestibulandoFromDB) {
            return res.status(400).send('Vestibulando não encontrado.')
        }

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: vestibulando_faculdade.id_faculdade }).first()

        if(!faculdadeFromDB) {
            return res.status(400).send('Faculdade não encontrada.')
        }

        if(vestibulandoFromDB && faculdadeFromDB) {
            rowsFound = await app.db('vestibulando_faculdade')
                .select('id', 'id_vestibulando', 'id_faculdade')
                    .where(
                        { 
                            id_vestibulando: vestibulando_faculdade.id_vestibulando, 
                            id_faculdade: vestibulando_faculdade.id_faculdade 
                        }
                    ).first()
            
            if(rowsFound) {
                res.json(true)
            } else {
                res.json(false)
            }
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }

    }

    const getVestibulandosFaculdadesByName = async (req, res) => {

        textSearch = req.body.textSearch

        app.db('faculdade')
            .where('nome', 'ILIKE', `%${textSearch}%`)
            .then(faculdades => {
                faculdades.forEach(faculdade => {
                    faculdade.data_prova_formatada = formatDate(faculdade.data_prova)
                });
                app.db('vestibulando')
                    .where('nome', 'ILIKE', `%${textSearch}%`)
                    .then(vestibulandos => {
                        vestibulandos.forEach(vestibulando => {
                            vestibulando.data_nascimento_formatada = formatDate(vestibulando.data_nascimento)
                        });
                        res.json({ faculdades, vestibulandos })
                    })
            })
            .catch(err => res.status(500).send(err))
    }


    const getFollowersByIdFaculdade = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Faculdade não informada!')
        }

        app.db('vestibulando_faculdade')
            .select('id_vestibulando')
            .where({ id_faculdade: req.params.id })
            .then(ids_followers => {
                Promise.all(ids_followers.map(follower => {
                    return app.db('vestibulando')
                        .select('id', 'nome', 'email', 'data_nascimento', 'curso', 'path_imagem', 'ativo')
                        .where({ id: follower.id_vestibulando })
                        .first()
                        .then(followerData => followerData)
                })).then(vestibulandos => {
                    res.json(vestibulandos);
                });
            })
            .catch(err => res.status(500).send(err))
    }

    const getFollowingFaculdades = async (req, res) => {

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
                        .then(followingData => followingData)
                })).then(faculdades => {
                    faculdades.forEach(faculdade => {
                        faculdade.data_prova_formatada = formatDate(faculdade.data_prova)
                    });
                    res.json(faculdades);
                });
            })
            .catch(err => res.status(500).send(err))
    }

    const uploadProfileImage = async (req, res) => {
        
        if(!req.params.id || !req.params.folder) {
            return res.status(400).send('Ocorreu um erro!')
        }

        const update = { path_imagem: null }
        const path = `uploads/${req.params.folder}/${req.file.filename}`
        update.path_imagem = path

        app.db(req.params.folder)
            .update(update)
            .where({ id: req.params.id })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))

    }

    const getPathImage = async (req, res) => {

        if(!req.params.id || !req.params.user_type) {
            return res.status(400).send('Ocorreu um erro!')
        }

        app.db(req.params.user_type)
            .select('path_imagem')
            .where({ id: req.params.id })
            .then(path => res.json(path))
            .catch(err => res.status(500).send(err))
        
    }
    

    return { followUnfollowFaculdade, checkFollower, getFollowersByIdFaculdade, getVestibulandosFaculdadesByName, getFollowingFaculdades, uploadProfileImage, getPathImage }

}