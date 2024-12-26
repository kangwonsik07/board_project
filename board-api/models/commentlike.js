const Sequelize = require('sequelize')

module.exports = class Commentlike extends Sequelize.Model {
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
            modelName: 'Commentlike',
            tableName: 'commentlikes',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Commentlike.belongsTo(db.Comment)
      db.Commentlike.belongsTo(db.User)
   }
}
