var Sequelize, sqlz;

Sequelize = require('sequelize');

sqlz = require('../../secrets/database').getSql();

module.exports = {
  comment: sqlz.define('comment', {
    idx: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    posting_idx: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user_idx: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user_nickname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT
    }
  })
};
