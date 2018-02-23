var assert, sequaelize, util;

assert = require('assert');

sequaelize = require('../secrets/database').getSql();

util = require('../scripts/tools/util');

describe('PRINT', function() {
  util.setDateProto();
  console.log(new Date().getTimeString());
  console.log(new Date().getTimedFileName());
  console.log(util.createSalt());
  console.log(util.createToken());
  console.log(util.hashMD5("HELLOeBcJne7I9C1wz6LHKabh"));
  return sequaelize.authenticate().then(function() {
    return console.log('successful');
  }).catch(function() {
    return console.log('failed');
  });
});


// 해시하면 32글자가 됨
