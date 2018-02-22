// const app = require('./app');
const account = require('./scripts/models/account');

var User = account.user;
User.sync({force: true}).then(() => {
  console.log("TABLE USER CREATED");
});