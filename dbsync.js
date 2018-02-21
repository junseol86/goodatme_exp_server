const app = require('./app');
const Sequelize = require('sequelize');
const sequelize = require('./secrets/database').getSql();

var User = sequelize.define('user', {
  idx: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  id: {type: Sequelize.STRING, unique: true, allowNull: false},
  salt: {type: Sequelize.STRING, allowNull: false},
  hash: {type: Sequelize.STRING, allowNull: false},
  type: {type: Sequelize.STRING},
  from: {type: Sequelize.STRING},
  from_id: {type: Sequelize.STRING},
})

User.sync({force: true}).then(() => {
  console.log("TABLE USER CREATED");
});