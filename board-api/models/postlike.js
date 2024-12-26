const Sequelize = require('sequelize')

module.exports = class Postlike extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            likecheck: {
               type: Sequelize.BOOLEAN,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Postlike',
            tableName: 'postlikes',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Postlike.belongsTo(db.Post)
      db.Postlike.belongsTo(db.User)
   }
}
