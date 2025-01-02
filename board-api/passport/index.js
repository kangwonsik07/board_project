const passport = require('passport')
const local = require('./localStrategy')
const User = require('../models/user')

module.exports = () => {
   // 직렬화
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })

   passport.deserializeUser((id, done) => {
      User.findOne({
         where: { id },
         attributes: ['id', 'nick', 'email', 'img', 'description', 'createdAt', 'updatedAt'],
      })
         .then((user) => done(null, user))
         .catch((err) => done(err))
   })

   local()
}
