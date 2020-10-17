const { authSecret } = require('../.env')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const params = {
        secretOrKey: authSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const strategy = new Strategy(params, (payload, done) => {
        if(payload.data_nascimento) {
            app.db('vestibulando')
                .where({ id: payload.id })
                .first()
                .then(vestibulando => done(null, vestibulando ? { ...payload } : false))
                .catch(err => done(err, false))
        } else {
            app.db('faculdade')
                .where({ id: payload.id })
                .first()
                .then(faculdade => done(null, faculdade ? { ...payload } : false))
                .catch(err => done(err, false))
        }
    })

    passport.use(strategy)

    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}