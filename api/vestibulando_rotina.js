module.exports = app => {

    const { existsOrError } = app.api.validation

    const saveRotina = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Vestibulando não informado!')
        }

        vestibulando_rotina = { ...req.body }
        vestibulando_rotina.id_vestibulando = req.params.id

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: vestibulando_rotina.id_vestibulando }).first()

        if(vestibulandoFromDB) {
            app.db('vestibulando_rotina')
                .insert(vestibulando_rotina)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Vestibulando não encontrado.')
        }
    }

    const updateRotina = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Ocorreu um erro!')
        }

        const vestibulando_rotina = { ...req.body }

        if(req.params.id) {
            app.db('vestibulando_rotina')
                .update(vestibulando_rotina)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const getRotinaByIdVestibulando = async (req, res) => {
        app.db('vestibulando_rotina')
            .select(
                'id', 'id_vestibulando', 'segunda_feira', 
                'terca_feira', 'quarta_feira', 'quinta_feira', 
                'sexta_feira', 'sabado', 'domingo')
            .where({ id_vestibulando: req.params.id })
            .first()
            .then(rotina => res.json(rotina))
            .catch(err => res.status(500).send(err))
    }

    const getRotinaById = async (req, res) => {
        app.db('vestibulando_rotina')
            .select(
                'id', 'id_vestibulando', 'segunda_feira', 
                'terca_feira', 'quarta_feira', 'quinta_feira', 
                'sexta_feira', 'sabado', 'domingo')
            .where({ id: req.params.id })
            .first()
            .then(rotina => res.json(rotina))
            .catch(err => res.status(500).send(err))
    }

    const deleteRotina = async (req, res) => {
        try {
            const rowsDeleted = await app.db('vestibulando_rotina')
                .where({ id: req.params.id }).del()
            
            try {
                existsOrError(rowsDeleted, 'Rotina não encontrada.')
            } catch(msg) {
                return res.status(400).send(msg)    
            }

            res.status(204).send()
        } catch(msg) {
            res.status(500).send(msg)
        }
    }

    return { saveRotina, updateRotina, getRotinaByIdVestibulando, getRotinaById, deleteRotina }

}