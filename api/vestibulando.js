const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError, formatDate } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const saveVestibulando = async (req, res) => {

        const vestibulando = { ...req.body }

        try {
            existsOrError(vestibulando.nome , 'Nome completo não informado.')
            existsOrError(vestibulando.data_nascimento , 'Data de nascimento não informada.')
            existsOrError(vestibulando.curso , 'Curso desejado não informado.')
            existsOrError(vestibulando.email , 'Email não informado.')
            existsOrError(vestibulando.senha , 'Senha não informada.')
            existsOrError(vestibulando.confirmacao_senha , 'Confirmação de Senha inválida.')
            equalsOrError(vestibulando.senha, vestibulando.confirmacao_senha, 'Senhas não conferem.')

            const vestibulandoFromDB = await app.db('vestibulando')
                .where({ email: vestibulando.email }).first()

            if(!vestibulando.id) {
                notExistsOrError(vestibulandoFromDB, 'Email informado já cadastrado em uma conta.')
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }

        if(vestibulando.senha.length < 5) {
            return res.status(400).send('Senha deve conter no mínimo 5 caracteres!')
        }

        vestibulando.senha = encryptPassword(vestibulando.senha)
        delete vestibulando.confirmacao_senha

        app.db('vestibulando')
            .insert(vestibulando)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const updateVestibulando = async (req, res) => {

        const vestibulando = { ...req.body }

        if(!req.params.id) {
            return res.status(400).send('Ocorreu um erro!')
        }

        try {
            existsOrError(vestibulando.nome , 'Nome não informado.')
            existsOrError(vestibulando.email , 'Email não informado.')
            existsOrError(vestibulando.data_nascimento , 'Data de nascimento não informada.')
            existsOrError(vestibulando.curso , 'Curso desejado não informado.')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        delete vestibulando.data_nascimento_formatada

        if(req.params.id) {
            app.db('vestibulando')
                .update(vestibulando)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const updateSenhaVestibulando = async (req, res) => {

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

        const vestibulandoFromDB = await app.db('vestibulando')
            .where({ id: req.params.id })
            .first()

        const isMatch = bcrypt.compareSync(senhas.senha_atual, vestibulandoFromDB.senha)

        if(!isMatch) return res.status(401).send('Senha atual inválida!')

        senhas.senha = encryptPassword(senhas.senha)
        delete senhas.senha_atual
        delete senhas.confirmacao_senha

        if(req.params.id) {
            app.db('vestibulando')
                .update(senhas)
                .where({ id: req.params.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            return res.status(400).send('Ocorreu um erro!')
        }
    }

    const getVestibulandos = (req, res) => {
        app.db('vestibulando')
            .select('id', 'nome', 'email', 'data_nascimento', 'curso', 'path_imagem', 'ativo')
            .where({ ativo: true })
            .then(vestibulandos => res.json(vestibulandos))
            .catch(err => res.status(500).send(err))
    }

    const getVestibulandoById = (req, res) => {
        app.db('vestibulando')
            .select('id', 'nome', 'email', 'data_nascimento', 'curso', 'path_imagem', 'ativo')
            .where({ id: req.params.id })
            .first()
            .then(vestibulando => {
                vestibulando.data_nascimento_formatada = formatDate(vestibulando.data_nascimento)
                res.json(vestibulando)
            })
            .catch(err => res.status(500).send(err))
    }

    const deactivateVestibulando = async (req, res) => {
        try {
            const rowsUpdated = await app.db('vestibulando')
                .update({ ativo: false })
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Vestibulando não encontrado.')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    const reactivateVestibulando = async (req, res) => {
        try {
            const rowsUpdated = await app.db('vestibulando')
                .update({ ativo: true })
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Vestibulando não encontrado.')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    return { saveVestibulando, updateVestibulando, updateSenhaVestibulando, getVestibulandos, getVestibulandoById, deactivateVestibulando, reactivateVestibulando }
}