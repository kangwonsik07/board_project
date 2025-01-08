const Sequelize = require('sequelize')

module.exports = class Post extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            title: {
               type: Sequelize.STRING(150),
               allowNull: false,
            },
            content: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
            views: {
               type: Sequelize.INTEGER,
               allowNull: true,
            },
            like: {
               type: Sequelize.INTEGER,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Post.hasMany(db.Postlike)
      db.Post.hasMany(db.Comment)
      db.Post.belongsTo(db.Board)
      db.Post.belongsTo(db.User)
   }
}
