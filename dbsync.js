// const app = require('./app');
const account = require('./scripts/models/account');
const posting = require('./scripts/models/posting');

// var User = account.user;
// User.sync({force: true}).then(() => {
//   console.log("TABLE USER CREATED");
// });
// var Token = account.token;
// Token.sync({force: true}).then(() => {
//   console.log("TABLE TOKEN CREATED");
// });
var Posting = posting.posting;
Posting.sync({force: true}).then(() => {
  console.log("TABLE POSTING CREATED");
});