const express = require('express')
const path = require('path')
const morgan = require('morgan')
require('dotenv').config()
const cors = require('cors')
const passport = require('passport')
const cookieParser = require('cookie-parser') // 쿠키 처리 미들웨어
const session = require('express-session') // 세션 관리 미들웨어

const indexRouter = require('./routes')
const authRouter = require('./routes/auth')
const { sequelize } = require('./models')
const passportConfig = require('./passport')

const app = express()
passportConfig()
app.set('port', process.env.PORT || 8002)

sequelize
   .sync({ force: false }) // 기존 테이블을 초기화 할지 여부-> 초기화 X
   .then(() => {
      console.log('데이터베이스 연결 성공')
   })
   .catch((err) => {
      console.error(`데이터 베이스 연결 실패: ${err}`)
   })

app.use(
   cors({
      origin: 'http://localhost:3000', // 특정 주소만 request 허용
      credentials: true, // 쿠키, 세션 등 인증 정보 허용
   })
)

app.use(morgan('dev')) // HTTP 요청 로깅 (dev 모드)
app.use(express.static(path.join(__dirname, 'uploads'))) // 정적 파일 제공
app.use(express.json()) // JSON 데이터 파싱
app.use(express.urlencoded({ extended: false })) // URL-encoded 데이터 파싱
app.use(cookieParser(process.env.COOKIE_SECREY)) //쿠키 설정

// 세션 설정
app.use(
   session({
      resave: false, // 세션 데이터가 변경되면 재저장 할지 여부
      saveUninitialized: true, // 초기화 되지 않은 세션 저장 여부 -> 초기화 되지않은 빈세션도 가능
      secret: process.env.COOKIE_SECRET, //세션 암호화 키
      cookie: {
         httpOnly: true, //javascript로 쿠키에 접근 가능한지 여부 -> ture일경우 접근 X
         secure: false, // https를 사용할때만 쿠키 전송 여부 -> http,https둘다 사용가능
      },
   })
)

app.use(passport.initialize()) //초기화
app.use(passport.session()) // passport와 생성해둔 세션 연결

app.use('/', indexRouter)
app.use('/auth', authRouter)

// 잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`) // 에러객체 생성
   error.status = 404 // 404에러코드 설정
   next(error) // 에러 미들웨어로 전달
})

//에러 미들웨어
app.use((err, req, res, next) => {
   const statusCode = err.status || 500 //err.status가 있으면 err.status 저장 없으면 500
   const errorMessage = err.message || '서버 내부 오류'

   // 개발 중에 서버 콘솔에서 상세한 에러 확인 용도
   console.log(err)

   res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err,
   })
})

app.options('*', cors()) // 모든 경로에 대한 options 요청을 허용
app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
})
