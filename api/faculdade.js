const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError, formatDate } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const saveFaculdade = async (req, res) => {

        const faculdade = { ...req.body }

        try {
            existsOrError(faculdade.nome , 'Nome não informado.')
            existsOrError(faculdade.email , 'Email não informado.')
            existsOrError(faculdade.data_prova , 'Data da prova não informada.')
            existsOrError(faculdade.endereco , 'Endereço não informado.')
            existsOrError(faculdade.telefone , 'Telefone não informado.')
            existsOrError(faculdade.senha , 'Senha não informada.')
            existsOrError(faculdade.confirmacao_senha , 'Confirmação de Senha inválida.')
            equalsOrError(faculdade.senha, faculdade.confirmacao_senha, 'Senhas não conferem.')

            const faculdadeFromDB = await app.db('faculdade')
                .where({ email: faculdade.email }).first()

            if(!faculdade.id) {
                notExistsOrError(faculdadeFromDB, 'Email informado já está vinculado a uma conta.')
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(faculdade.senha.length < 5) {
            return res.status(400).send('Senha deve conter no mínimo 5 caracteres!')
        }

        faculdade.senha = encryptPassword(faculdade.senha)
        delete faculdade.confirmacao_senha

        app.db('faculdade')
            .insert(faculdade)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const updateFaculdade = async (req, res) => {

        const faculdade = { ...req.body }

        if(!req.params.id) {
            return res.status(400).send('Ocorreu um erro!')
        }

        try {
            existsOrError(faculdade.nome , 'Nome não informado.')
            existsOrError(faculdade.email , 'Email não informado.')
            existsOrError(faculdade.data_prova , 'Data da prova não informada.')
            existsOrError(faculdade.telefone , 'Telefone não informado.')
            existsOrError(faculdade.endereco , 'Endereço não informado.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        delete faculdade.data_prova_formatada

        if(req.params.id) {
            app.db('faculdade')
                .update(faculdade)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const updateSenhaFaculdade = async (req, res) => {

        if(!req.params.id) {
            return res.status(400).send('Ocorreu um erro!')
        }
        
        const senhas = { ...req.body }

        try {
            existsOrError(senhas.senha_atual , 'Senha atual não informada.')
            existsOrError(senhas.senha , 'Nova Senha não informada.')
            existsOrError(senhas.confirmacao_senha , 'Confirmação de Senha inválida.')
            equalsOrError(senhas.senha, senhas.confirmacao_senha, 'Senha e Confirmação de senha não conferem.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        const faculdadeFromDB = await app.db('faculdade')
            .where({ id: req.params.id })
            .first()

        const isMatch = bcrypt.compareSync(senhas.senha_atual, faculdadeFromDB.senha)

        if(!isMatch) return res.status(401).send('Senha atual inválida!')

        senhas.senha = encryptPassword(senhas.senha)
        delete senhas.senha_atual
        delete senhas.confirmacao_senha

        if(req.params.id) {
            app.db('faculdade')
                .update(senhas)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const getFaculdades = (req, res) => {
        app.db('faculdade')
            .select('id', 'nome', 'email', 'data_prova', 'telefone', 'endereco', 'path_imagem', 'ativo')
            .where({ ativo: true })
            .then(faculdades => res.json(faculdades))
            .catch(err => res.status(500).send(err))
    }

    const getFaculdadeById = (req, res) => {
        app.db('faculdade')
            .select('id', 'nome', 'email', 'data_prova', 'telefone', 'endereco', 'path_imagem', 'ativo')
            .where({ id: req.params.id })
            .first()
            .then(faculdade => {
                faculdade.data_prova_formatada = formatDate(faculdade.data_prova)
                res.json(faculdade)
            })
            .catch(err => res.status(500).send(err))
    }

    const deactivateFaculdade = async (req, res) => {
        try {
            const rowsUpdated = await app.db('faculdade')
                .update({ ativo: false })
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Faculdade não encontrada.')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    const reactivateFaculdade = async (req, res) => {
        try {
            const rowsUpdated = await app.db('faculdade')
                .update({ ativo: true })
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Faculdade não encontrada.')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    return { saveFaculdade, updateFaculdade, updateSenhaFaculdade, getFaculdades, getFaculdadeById, deactivateFaculdade, reactivateFaculdade }
}