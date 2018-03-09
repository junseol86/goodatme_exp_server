
Sequelize = require('sequelize');
sqlz = require('../../secrets/database').getSql();

module.exports = {
  question: sqlz.define 'question', {
    idx: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true}
    active: {type: Sequelize.INTEGER}
    question: {type: Sequelize.STRING}
    positive: {type: Sequelize.STRING}
    negative: {type: Sequelize.STRING}
    circle: {type: Sequelize.INTEGER, default: 0}
    triangle: {type: Sequelize.INTEGER, default: 0}
    square: {type: Sequelize.INTEGER, default: 0}
    star: {type: Sequelize.INTEGER, default: 0}
    infinity: {type: Sequelize.INTEGER, default: 0}
    clover: {type: Sequelize.INTEGER, default: 0}
    diamond: {type: Sequelize.INTEGER, default: 0}
    heart: {type: Sequelize.INTEGER, default: 0}
    spade: {type: Sequelize.INTEGER, default: 0}
  }
}

