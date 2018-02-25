Sequelize = require('sequelize');
sqlz = require('../../secrets/database').getSql();

module.exports = {
  user: sqlz.define 'user', {
    idx: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true}
    email: {type: Sequelize.STRING, unique: true, allowNull: false}
    nickname: {type: Sequelize.STRING, allowNull: false}
    salt: {type: Sequelize.STRING, allowNull: false}
    hash: {type: Sequelize.STRING, allowNull: false}
    type: {type: Sequelize.STRING}
    from: {type: Sequelize.STRING}
    from_id: {type: Sequelize.STRING}
    shape: {type: Sequelize.STRING}
    color_str: {type: Sequelize.STRING}
    color_r: {type: Sequelize.INTEGER}
    color_g: {type: Sequelize.INTEGER}
    color_b: {type: Sequelize.INTEGER}
  }
  token: sqlz.define 'token', {
    idx:  {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true}
    user_idx: {type: Sequelize.INTEGER, unique: true}
    token: {type: Sequelize.STRING}
  }
}