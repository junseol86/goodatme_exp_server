Sequelize = require('sequelize');
sqlz = require('../../secrets/database').getSql();

module.exports = {
  favorite: sqlz.define 'favorite', {
    idx: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true}
    user_idx: {type: Sequelize.INTEGER, allowNull: false}
    posting_idx: {type: Sequelize.INTEGER, allowNull: false}
  }
}