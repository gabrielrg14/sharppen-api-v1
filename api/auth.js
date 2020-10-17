const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const signin = async (req, res) => {
        if(!req.body.email || !req.body.senha) {
            return res.status(400).send('Informe Email e Senha!')
        }

        const vestibulando = await app.db('vestibulando')
            .where({ email: req.body.email })
            .first()

        if(vestibulando) {
            const isMatch = bcrypt.compareSync(req.body.senha, vestibulando.senha)

            if(!isMatch) return res.status(401).send('Email e/ou Senha inválido(s)!')

            const now = Math.floor(Date.now() / 1000)

            // Token jwt
            const payload = {
                id: vestibulando.id,
                nome: vestibulando.nome,
                email: vestibulando.email,
                data_nascimento: vestibulando.data_nascimento,
                curso: vestibulando.curso,
                path_imagem: vestibulando.path_imagem,
                ativo: vestibulando.ativo,
                iat: now,
                exp: now + (60 * 60 * 24 * 5) // 5 dias de expiração
            }

            res.json({
                ...payload,
                token: jwt.encode(payload, authSecret)
            })

            return
        }

        const faculdade = await app.db('faculdade')
            .where({ email: req.body.email })
            .first()

        if(faculdade) {
            const isMatch = bcrypt.compareSync(req.body.senha, faculdade.senha)
    
            if(!isMatch) return res.status(401).send('Email e/ou Senha inválido(s)!')

            const now = Math.floor(Date.now() / 1000)

            // Token jwt
            const payload = {
                id: faculdade.id,
                nome: faculdade.nome,
                email: faculdade.email,
                data_prova: faculdade.data_prova,
                telefone: faculdade.telefone,
                endereco: faculdade.endereco,
                path_imagem: faculdade.path_imagem,
                ativo: faculdade.ativo,
                iat: now,
                exp: now + (60 * 60 * 24 * 3) // 3 dias de expiração
            }

            res.json({
                ...payload,
                token: jwt.encode(payload, authSecret)
            })

            return
        }

        return res.status(400).send('Usuário informado não existe!')
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null

        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        } catch(e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}