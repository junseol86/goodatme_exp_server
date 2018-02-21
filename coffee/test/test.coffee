assert = require 'assert'
sequaelize = require('../secrets/database').getSql()
util = require '../tools/util'

describe 'PRINT', () ->
  util.setDateProto()
  console.log new Date().getTimeString()
  console.log new Date().getTimedFileName()
  console.log util.createSalt()
  console.log util.hashMD5 "HELLOeBcJne7I9C1wz6LHKabh"
  sequaelize.authenticate().then(() ->
    console.log 'successful').catch(() ->
    console.log 'failed')
    
  # 해시하면 32글자가 됨