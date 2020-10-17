module.exports = app => {

    app.post('/signup/vestibulando', app.api.vestibulando.saveVestibulando)
    app.post('/signup/faculdade', app.api.faculdade.saveFaculdade)
    app.post('/signin', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)
    
    app.route('/vestibulando')
        .all(app.config.passport.authenticate())
        .get(app.api.vestibulando.getVestibulandos)

    app.route('/vestibulando/:id')
        .get(app.api.vestibulando.getVestibulandoById)
        .all(app.config.passport.authenticate())
        .put(app.api.vestibulando.updateVestibulando)
        .patch(app.api.vestibulando.updateSenhaVestibulando)
        
    app.route('/vestibulando/deactivate/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.vestibulando.deactivateVestibulando)

    app.route('/vestibulando/reactivate/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.vestibulando.reactivateVestibulando)

    app.route('/faculdade')
        .all(app.config.passport.authenticate())
        .get(app.api.faculdade.getFaculdades)

    app.route('/faculdade/:id')
        .get(app.api.faculdade.getFaculdadeById)
        .all(app.config.passport.authenticate())
        .put(app.api.faculdade.updateFaculdade)
        .patch(app.api.faculdade.updateSenhaFaculdade)

    app.route('/faculdade/deactivate/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.faculdade.deactivateFaculdade)

    app.route('/faculdade/reactivate/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.faculdade.reactivateFaculdade)
    
    app.route('/faculdade_curso/:id')
        .get(app.api.faculdade_curso.getCursoById)
        .all(app.config.passport.authenticate())
        .post(app.api.faculdade_curso.saveCurso)
        .put(app.api.faculdade_curso.updateCurso)
        .delete(app.api.faculdade_curso.deleteCurso)
        
    app.route('/faculdade_curso/faculdade/:id')
        .get(app.api.faculdade_curso.getCursosByIdFaculdade)

    app.route('/faculdade_livro/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.faculdade_livro.saveLivro)
        .get(app.api.faculdade_livro.getLivroById)
        .put(app.api.faculdade_livro.updateLivro)
        .delete(app.api.faculdade_livro.deleteLivro)
        
    app.route('/faculdade_livro/faculdade/:id')
        .get(app.api.faculdade_livro.getLivrosByIdFaculdade)

    app.route('/faculdade_livro/vestibulando/:id')
        .get(app.api.faculdade_livro.getLivrosOfFollowingFaculdades)
        
    app.route('/vestibulando_rotina/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.vestibulando_rotina.getRotinaById)
        .post(app.api.vestibulando_rotina.saveRotina)
        .put(app.api.vestibulando_rotina.updateRotina)
        .delete(app.api.vestibulando_rotina.deleteRotina)
        
    app.route('/vestibulando_rotina/vestibulando/:id')
        .get(app.api.vestibulando_rotina.getRotinaByIdVestibulando)
        
    app.route('/vestibulando_faculdade/follow_unfollow/:id')
        .all(app.config.passport.authenticate())
        .post(app.api.vestibulando_faculdade.followUnfollowFaculdade)
        
    app.route('/vestibulando_faculdade/check/:id')
        .post(app.api.vestibulando_faculdade.checkFollower)

    app.route('/vestibulando_faculdade/search')
        .post(app.api.vestibulando_faculdade.getVestibulandosFaculdadesByName)

    app.route('/vestibulando_faculdade/followers/:id')
        .get(app.api.vestibulando_faculdade.getFollowersByIdFaculdade)

    app.route('/vestibulando_faculdade/following/:id')
        .get(app.api.vestibulando_faculdade.getFollowingFaculdades)

    app.route('/upload/:folder/:id')
        .post(app.upload.single('file'), app.api.vestibulando_faculdade.uploadProfileImage)

    app.route('/path_imagem/:user_type/:id')
        .get(app.api.vestibulando_faculdade.getPathImage)

    app.route('/faculdade_postagem/:id')
        .get(app.api.faculdade_postagem.getPostagensOfFollowingFaculdades)
        .all(app.config.passport.authenticate())
        .post(app.api.faculdade_postagem.savePostagem)
        .put(app.api.faculdade_postagem.updatePostagem)
        .delete(app.api.faculdade_postagem.deletePostagem)
    
    app.route('/faculdade_postagem/faculdade/:id')
        .get(app.api.faculdade_postagem.getPostagensByIdFaculdade)

    app.route('/reacao_postagem/react_unreact/:id')
        .post(app.api.reacao_postagem.reactUnreactPost)

    app.route('/reacao_postagem/check/:id')
        .post(app.api.reacao_postagem.checkReactedPost)

    app.route('/reacao_postagem/numberOfReactions/:id')
        .get(app.api.reacao_postagem.getNumberOfReactions)

    app.route('/reacao_postagem/reactors/:id')
        .get(app.api.reacao_postagem.getReactorsByIdPost)

    app.route('/comentario_postagem/:id')
        .post(app.api.comentario_postagem.saveComment)
        .put(app.api.comentario_postagem.updateComment)
        .delete(app.api.comentario_postagem.removeComment)

    app.route('/comentario_postagem/:id/:id_viewer/:viewer_type')
        .get(app.api.comentario_postagem.getCommentsByIdPost)
}