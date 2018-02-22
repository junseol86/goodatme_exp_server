var Sequelize, sqlz;

Sequelize = require('sequelize');

sqlz = require('../../secrets/database').getSql();

module.exports = {
  user: sqlz.define('user', {
    idx: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    salt: {
      type: Sequelize.STRING,
      allowNull: false
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING
    },
    from: {
      type: Sequelize.STRING
    },
    from_id: {
      type: Sequelize.STRING
    }
  })
};
