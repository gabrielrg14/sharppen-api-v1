module.exports = app => {

    const { existsOrError, formatDate } = app.api.validation

    const savePostagem = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Faculdade não informada!')
        }

        faculdade_postagem = { ...req.body }
        faculdade_postagem.id_faculdade = req.params.id

        try {
            existsOrError(faculdade_postagem.conteudo, 'Conteúdo da postagem não informado.')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        faculdade_postagem.data_postagem = new Date().toISOString();

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: faculdade_postagem.id_faculdade }).first()

        if (faculdadeFromDB) {
            app.db('faculdade_postagem')
                .insert(faculdade_postagem)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Faculdade não encontrada.')
        }
    }

    const updatePostagem = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        }

        faculdade_postagem = { ...req.body }
        faculdade_postagem.conteudo = faculdade_postagem.conteudo_edit

        try {
            existsOrError(faculdade_postagem.conteudo, 'Conteúdo da postagem não informado.')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        delete faculdade_postagem.data_postagem
        delete faculdade_postagem.conteudo_edit
        delete faculdade_postagem.editPost
        delete faculdade_postagem.reactions
        delete faculdade_postagem.wasReacted
        delete faculdade_postagem.reactors
        delete faculdade_postagem.comments
        delete faculdade_postagem.comment

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: faculdade_postagem.id_faculdade }).first()

        if(!faculdadeFromDB) {
            return res.status(400).send('Faculdade não encontrada.')
        }

        const postagemFromDB = await app.db('faculdade_postagem')
        .where(
            { 
                id: req.params.id,
                id_faculdade: faculdade_postagem.id_faculdade 
            }
        ).first()

        if(!postagemFromDB) {
            return res.status(400).send('Postagem não encontrada.')
        }

        if (faculdadeFromDB && postagemFromDB) {
            app.db('faculdade_postagem')
                .update(faculdade_postagem)
                .where({ id: faculdade_postagem.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro.')
        }
    }

    const getPostagensByIdFaculdade = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Faculdade não informada!')
        }

        app.db('faculdade_postagem')
            .select('id', 'id_faculdade', 'conteudo', 'data_postagem')
            .where({ id_faculdade: req.params.id })
            .orderBy('data_postagem', 'desc')
            .then(postagens => {
                postagens.map(post => {
                    post.conteudo = post.conteudo.toString()
                    post.data_postagem = formatDate(post.data_postagem)
                    post.editPost = false
                    post.conteudo_edit = post.conteudo
                    post.reactions = "0"
                    post.wasReacted = false
                    post.comment = ""
                })
                return res.json(postagens)
            })
            .catch(err => res.status(500).send(err))
    }

    const getPostagensOfFollowingFaculdades = async (req, res) => {

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
                        Promise.all(faculdades.map(faculdade => {
                            return app.db('faculdade_postagem')
                                .select('id', 'id_faculdade', 'conteudo', 'data_postagem')
                                .where({ id_faculdade: faculdade.id })
                                .orderBy('data_postagem', 'asc')
                                .then(data => {
                                    data.path_imagem = faculdade.path_imagem
                                    data.nome_faculdade = faculdade.nome
                                    return data
                                })
                        })).then(postagensFaculdade => {
                            let postagens = []

                            for (let i = 0; i < postagensFaculdade.length; i++) {
                                let count = 0

                                postagensFaculdade[i][count.toString()].nome_faculdade = postagensFaculdade[i].nome_faculdade
                                postagensFaculdade[i][count.toString()].path_imagem = postagensFaculdade[i].path_imagem
                                postagens.push(postagensFaculdade[i][count.toString()])

                                count++
                                if(postagensFaculdade[i][count.toString()]) {
                                    postagens.push(postagensFaculdade[i][count.toString()])
                                    postagensFaculdade[i][count.toString()].nome_faculdade = postagensFaculdade[i].nome_faculdade
                                    postagensFaculdade[i][count.toString()].path_imagem = postagensFaculdade[i].path_imagem
                                }
                            }

                            Promise.all(postagens.map(post => {
                                post.conteudo = post.conteudo.toString()
                                post.data_postagem_formatada = formatDate(post.data_postagem)
                                post.conteudo_edit = post.conteudo
                                post.reactions = "0"
                                post.wasReacted = false
                                post.comment = ""
                            }))
                            postagens.sort(function(postA, postB) {
                                return postB.data_postagem - postA.data_postagem
                            })
                            res.json(postagens)
                        })
                });
            })
            .catch(err => res.status(500).send(err))
    }

    const deletePostagem = async (req, res) => {
        try {
            await app.db('reacao_postagem')
                .where({ id_postagem: req.params.id }).del()
        } catch(msg) {
            res.status(500).send(msg)
        }

        try {
            await app.db('comentario_postagem')
                .where({ id_postagem: req.params.id }).del()
        } catch(msg) {
            res.status(500).send(msg)
        }

        try {
            const postagemDeleted = await app.db('faculdade_postagem')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(postagemDeleted, 'Postagem não encontrada.')
            } catch(msg) {
                return res.status(400).send(msg)    
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }
    }

    return { savePostagem, updatePostagem, getPostagensByIdFaculdade, getPostagensOfFollowingFaculdades, deletePostagem }

}