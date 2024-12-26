const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const User = require('./user')
const Board = require('./board')
const Post = require('./post')
const Postlike = require('./postlike')
const Comment = require('./comment')
const Commentlike = require('./commentlike')

const db = {}
const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize
db.User = User
db.Board = Board
db.Post = Post
db.Postlike = Postlike
db.Comment = Comment
db.Commentlike = Commentlike

User.init(sequelize)
Board.init(sequelize)
Post.init(sequelize)
Postlike.init(sequelize)
Comment.init(sequelize)
Commentlike.init(sequelize)

User.associate(db)
Board.associate(db)
Post.associate(db)
Postlike.associate(db)
Comment.associate(db)
Commentlike.associate(db)

module.exports = db
