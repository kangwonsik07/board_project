const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user')

// 로그인 시 사용자 정보를 db에서 조회하고 사용자 존재여부와 비밀번호 비교 -> passport에 결과 전달

module.exports = () => {
   passport.use(
      new LocalStrategy(
         {
            usernameField: 'email',
            passwordField: 'password',
         },
         // 실제인증로직
         async (email, password, done) => {
            try {
               // 이메일로 사용자 조회
               const exUser = await User.findOne({ where: { email } })

               if (exUser) {
                  const result = await bcrypt.compare(password, exUser.password)

                  if (result) {
                     done(null, exUser)
                  } else {
                     done(null, false, { message: '비밀번호가 일치하지 않습니다' })
                  }
               } else {
                  done(null, false, { message: '가입되지 않은 회원입니다' })
               }
            } catch (error) {
               console.error(error)
               done(error)
            }
         }
      )
   )
}
