express = require 'express'
router = express.Router()
sequaelize = require('../../secrets/database').getSql()
util = require '../tools/util'
account = require '../models/account'
User = account.user

# 이메일 계정 존재 여부 확인
router.get '/checkEmailExists/:email', (req, res) ->
  checkEmailExists req, res, req.params.email, (user) ->
    res.send {
      count: user.count
    }

# 이메일 계정 존재 여부 확인 후 없으면 생성
router.post '/register', (req, res) ->
  checkEmailExists req, res, req.body.email, (user) ->
    if user.count != 0
      res.status(500).send 'ACCOUNT ALREADY EXISTS'
    else
      createAccount req, res

# 이메일 계정 존재 여부 확인
checkEmailExists = (req, res, email, func) ->
  user = User.findAndCountAll({where: {email: email}})
   .then func 

# 이메일 계정 생성
createAccount = (req, res) ->
  salt = util.createSalt()
  hash = util.hashMD5(req.body.password + salt)
  User.create({
    email: req.body.email
    salt: salt
    hash: hash
  }).then (savedUser) ->
    res.send savedUser

module.exports = router

