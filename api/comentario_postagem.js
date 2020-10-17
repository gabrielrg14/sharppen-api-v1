module.exports = app => {

    const { existsOrError, formatDate } = app.api.validation

    const saveComment = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        }

        comentario_postagem = { ...req.body }
        comentario_postagem.id_postagem = req.params.id

        try {
            existsOrError(comentario_postagem.id_vestibulando, 'Vestibulando não informado!')
            existsOrError(comentario_postagem.id_faculdade, 'Faculdade não informada!')
            existsOrError(comentario_postagem.conteudo, 'Conteúdo do comentário não informado!')
            existsOrError(comentario_postagem.tipo_usuario, 'Tipo de usuário não foi informado!')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        comentario_postagem.data_comentario = new Date().toISOString();

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: comentario_postagem.id_faculdade }).first()

        if(!faculdadeFromDB) {
            return res.status(400).send('Faculdade não encontrada.')
        }

        const postagemFromDB = await app.db('faculdade_postagem')
            .where(
                { 
                    id: comentario_postagem.id_postagem,
                    id_faculdade: comentario_postagem.id_faculdade 
                }
            ).first()

        if(!postagemFromDB) {
            return res.status(400).send('Postagem não encontrada.')
        }

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: comentario_postagem.id_vestibulando }).first()

        if(!vestibulandoFromDB) {
            return res.status(400).send('Vestibulando não encontrado.')
        }

        if(faculdadeFromDB && postagemFromDB && vestibulandoFromDB) {
            app.db('comentario_postagem')
                .insert(comentario_postagem)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }

    }

    const updateComment = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        }

        comentario_postagem = { ...req.body }
        comentario_postagem.conteudo = comentario_postagem.edit

        try {
            existsOrError(comentario_postagem.id_postagem, 'Postagem não informada.')
            existsOrError(comentario_postagem.id_vestibulando, 'Vestibulando não informado.')
            existsOrError(comentario_postagem.id_faculdade, 'Faculdade não informada.')
            existsOrError(comentario_postagem.conteudo, 'Conteúdo do comentário não informado.')
            existsOrError(comentario_postagem.tipo_usuario, 'Tipo de usuário não informado.')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        delete comentario_postagem.data_comentario
        delete comentario_postagem.data_comentario_formatada
        delete comentario_postagem.editComment
        delete comentario_postagem.edit
        delete comentario_postagem.answer
        delete comentario_postagem.id_usuario
        delete comentario_postagem.nome_usuario
        delete comentario_postagem.tipo_usuario
        delete comentario_postagem.path_imagem
        delete comentario_postagem.showInputAnswer
        delete comentario_postagem.answerComments

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: comentario_postagem.id_faculdade }).first()

        if(!faculdadeFromDB) {
            return res.status(400).send('Faculdade não encontrada.')
        }

        const postagemFromDB = await app.db('faculdade_postagem')
            .where(
                { 
                    id: comentario_postagem.id_postagem,
                    id_faculdade: comentario_postagem.id_faculdade 
                }
            ).first()

        if(!postagemFromDB) {
            return res.status(400).send('Postagem não encontrada.')
        }

        const comentarioFromDB = await app.db('comentario_postagem')
            .where(
                { 
                    id: req.params.id,
                    id_faculdade: comentario_postagem.id_faculdade 
                }
            ).first()

        if(!comentarioFromDB) {
            return res.status(400).send('Comentário não encontrado.')
        }

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: comentario_postagem.id_vestibulando }).first()

        if(!vestibulandoFromDB) {
            return res.status(400).send('Vestibulando não encontrado.')
        }

        if (faculdadeFromDB && postagemFromDB && comentarioFromDB && vestibulandoFromDB) {
            app.db('comentario_postagem')
                .update(comentario_postagem)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro.')
        }

    }

    const getCommentsByIdPost = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        } 

        if(!req.params.id_viewer) {
            return res.status(400).send('Usuário não informado!')
        }

        else {
            const comments = await app.db('comentario_postagem')
                .select('id', 'id_comentario_origem', 'id_postagem', 'id_vestibulando', 'id_faculdade', 'conteudo', 'tipo_usuario', 'data_comentario')
                .where({ id_postagem: req.params.id })
                .whereNull('id_comentario_origem')
                .orderBy('data_comentario', 'desc')
                .then(comments => {
                    comments.map(async comment => {
                        const answerComments = await app.db('comentario_postagem')
                            .select('id', 'id_comentario_origem', 'id_postagem', 'id_vestibulando', 'id_faculdade', 'conteudo', 'tipo_usuario', 'data_comentario')
                            .where({ 
                                id_postagem: req.params.id, 
                                id_comentario_origem: comment.id
                            })
                            .orderBy('data_comentario', 'desc')
                            .then(comments => { 
                                comments.map(async comment => {
                                    comment.conteudo = comment.conteudo.toString()
                                    comment.data_comentario_formatada = formatDate(comment.data_comentario)
                                    comment.edit = comment.conteudo
                                    comment.editComment = false
                                    comment.showInputAnswer = false
                                    comment.answer = ""

                                    if(comment.tipo_usuario == "faculdade") {
                                        comment.id_usuario = comment.id_faculdade
                                    } else {
                                        comment.id_usuario = comment.id_vestibulando
                                    }
                                    if(req.params.viewer_type == comment.tipo_usuario && req.params.id_viewer == comment.id_usuario) {
                                        comment.editComment = true
                                    }
                                })
                                return comments
                            })
                            .catch(err => res.status(500).send(err))

                        comment.answerComments = answerComments
                        comment.conteudo = comment.conteudo.toString()
                        comment.data_comentario_formatada = formatDate(comment.data_comentario)
                        comment.edit = comment.conteudo
                        comment.editComment = false
                        comment.showInputAnswer = false
                        comment.answer = ""
                        if(comment.tipo_usuario == "faculdade") {
                            comment.id_usuario = comment.id_faculdade
                        } else {
                            comment.id_usuario = comment.id_vestibulando
                        }
                        if(req.params.viewer_type == comment.tipo_usuario && req.params.id_viewer == comment.id_usuario) {
                            comment.editComment = true
                        }
                    })
                    return comments
                })
                .catch(err => res.status(500).send(err))
            
            Promise.all(comments.map(async comment => {
                let id_user = `id_${comment.tipo_usuario}`
                usuario = await app.db(comment.tipo_usuario)
                    .select('nome', 'path_imagem')
                    .where({ id: comment[id_user] })
                    .first()
                    .then(user => user)
                comment.nome_usuario = usuario.nome
                comment.path_imagem = usuario.path_imagem
                return comment
            })).then(comments => {
                res.json(comments)
            })
        }

    }

    const removeComment = async (req, res) => {

        if (!req.params.id) {
            return res.status(400).send('Postagem não informada!')
        }

        try {
            await app.db('comentario_postagem')
                .where({ id_comentario_origem: req.params.id }).del()
        } catch(msg) {
            res.status(500).send(msg)
        }

        try {
            const comentarioDeleted = await app.db('comentario_postagem')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(comentarioDeleted, 'Comentário não encontrada.')
            } catch(msg) {
                return res.status(400).send(msg)    
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }

    }

    return { saveComment, updateComment, getCommentsByIdPost, removeComment }

}