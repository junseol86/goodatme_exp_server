var assert, util;

assert = require('assert');

util = require('../tools/util');

describe('PRINT', function() {
  util.setDateProto();
  console.log(new Date().getTimeString());
  console.log(new Date().getTimedFileName());
  console.log(util.createSalt());
  return console.log(util.hashMD5("HELLOeBcJne7I9C1wz6LHKabh"));
});

// 해시하면 32글자가 됨
