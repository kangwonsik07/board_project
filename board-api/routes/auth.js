const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const multer = require('multer')
const path = require('path')
const { isLoggedIn, isNotLoggenIn } = require('./middlewares')

const fs = require('fs')
const router = express.Router()

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') // 해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') // 폴더 생성
}
// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치의 파일명 지정
   storage: multer.diskStorage({
      destination(req, res, cb) {
         cb(null, 'uploads/') // uploads폴더에 저장
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname) //파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodedFileName) //확장자 추출
         const basename = path.basename(decodedFileName, ext) //확장자 제거한 파일명 추출

         // 파일명 설정: 기존이름 + 업로드 날짜시간 + 확장자
         // dog.jpg
         // ex) dog + 1231342432443 + .jpg
         cb(null, basename + Date.now() + ext)
      },
   }),

   // 파일의 크기
   limits: { fileSize: 5 * 1024 * 1024 }, // 5mb 제한
})

// 회원가입
router.post('/signup', isNotLoggenIn, upload.single('img'), async (req, res, next) => {
   console.log('수신된 데이터:', req.body)
   const { email, nick, password, description } = req.body
   const img = req.file.filename
   console.log('파일 정보:', req.file)
   // 이메일로 기존사용자 검색
   try {
      const exUser = await User.findOne({ where: { email } })
      if (exUser) {
         return res.status(409).json({
            success: false,
            message: '이미 존재하는 사용자입니다.',
         })
      }

      const hash = await bcrypt.hash(password, 12)

      const newUser = await User.create({
         email,
         nick,
         password: hash,
         img,
         description,
      })
      console.log('수신된 데이터:', { email, nick, password, description, img })
      res.status(201).json({
         success: true,
         message: '사용자가 성공적으로 등록되었습니다.',
         user: {
            id: newUser.id,
            email: newUser.email,
            nick: newUser.nick,
            img,
            description: newUser.description,
         },
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({
         success: false,
         message: '회원가입 중 오류 발생',
         error,
      })
   }
})

// 로그인
router.post('/login', isNotLoggenIn, async (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         // 로그인중 에러 발생
         return res.status(500).json({ success: false, message: '인증 중 오류 발생', error: authError })
      }

      if (!user) {
         // 비밀번호 불일치 또는 사용자가 없을 경우
         return res.status(401).json({
            success: false,
            message: info.message || '로그인 실패',
         })
      }

      // 인중 정상 사용자를 로그인상태로 바꿈
      req.login(user, (loginError) => {
         if (loginError) {
            // 로그인 상태로 바꾸는중 오류
            return res.status(500).json({ success: false, message: '로그인 중 오류 발생', error: loginError })
         }

         //로그인 성공
         res.json({
            success: true,
            message: '로그인성공',
            user: {
               id: user.id,
               nick: user.nick,
               img: user.img,
               description: user.description,
            },
         })
      })
   })(req, res, next)
})

router.get('/logout', isLoggedIn, async (req, res, next) => {
   req.logout((err) => {
      if (err) {
         console.log(err)
         return res.status(500).json({
            success: false,
            message: '로그아웃 중 오류가 발생했습니다.',
            error: err,
         })
      }

      res.json({
         success: true,
         message: '로그아웃에 성공했습니다',
      })
   })
})

router.get('/status', async (req, res, next) => {
   if (req.isAuthenticated()) {
      res.json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            nick: req.user.nick,
            email: req.user.email,
            img: req.user.img,
            description: req.user.description,
         },
      })
   } else {
      res.json({
         isAuthenticated: false,
      })
   }
})

module.exports = router
