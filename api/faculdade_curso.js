module.exports = app => {

    const { existsOrError } = app.api.validation

    const saveCurso = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Faculdade não informada!')
        }

        faculdade_curso = { ...req.body }
        faculdade_curso.id_faculdade = req.params.id

        try {
            existsOrError(faculdade_curso.nome_curso, 'Nome do curso não informado.')
            existsOrError(faculdade_curso.periodo, 'Período do curso não informado.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: faculdade_curso.id_faculdade }).first()

        if(faculdadeFromDB) {
            app.db('faculdade_curso')
                .insert(faculdade_curso)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Faculdade não encontrada.')
        }
    }

    const updateCurso = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Ocorreu um erro!')
        }

        const faculdade_curso = { ...req.body }

        try {
            existsOrError(faculdade_curso.nome_curso, 'Nome do curso não informado.')
            existsOrError(faculdade_curso.periodo, 'Período do curso não informado.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(req.params.id) {
            app.db('faculdade_curso')
                .update(faculdade_curso)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const getCursosByIdFaculdade = async (req, res) => {
        app.db('faculdade_curso')
            .select('id', 'id_faculdade', 'nome_curso', 'periodo')
            .where({ id_faculdade: req.params.id })
            .then(cursos => res.json(cursos))
            .catch(err => res.status(500).send(err))
    }

    const getCursoById = (req, res) => {
        app.db('faculdade_curso')
            .select('id', 'id_faculdade', 'nome_curso', 'periodo')
            .where({ id: req.params.id })
            .first()
            .then(curso => res.json(curso))
            .catch(err => res.status(500).send(err))
    }

    const deleteCurso = async (req, res) => {
        try {
            const rowsDeleted = await app.db('faculdade_curso')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(rowsDeleted, 'Curso não encontrado.')
            } catch(msg) {
                return res.status(400).send(msg)    
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }
    }

    return { saveCurso, updateCurso, getCursosByIdFaculdade, getCursoById, deleteCurso }

}