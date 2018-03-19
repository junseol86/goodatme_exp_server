var Sequelize, sqlz;

Sequelize = require('sequelize');

sqlz = require('../../secrets/database').getSql();

module.exports = {
  posting: sqlz.define('posting', {
    idx: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_idx: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    editor: {
      type: Sequelize.STRING,
      default: ''
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    sub_category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rgn_do: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rgn_sgg: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rgn_emd: {
      type: Sequelize.STRING
    },
    rgn_ri: {
      type: Sequelize.STRING
    },
    shape: {
      type: Sequelize.STRING,
      allowNull: false
    },
    color_r: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    color_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    color_b: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    place: {
      type: Sequelize.STRING,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    brief: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    image: {
      type: Sequelize.STRING
    },
    hashtags: {
      type: Sequelize.STRING,
      allowNull: false
    },
    importance: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    views: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  })
};
