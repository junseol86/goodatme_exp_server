express = require 'express'
router = express.Router()
sequaelize = require('../../secrets/database').getSql()
util = require '../tools/util'
account = require '../models/account'
User = account.user

router.post '/register', (req, res) ->
  checkEmailExists(req, res)

checkEmailExists = (req, res) ->
  email = req.body.email
  user = User.findAndCountAll({where: {email: email}})
   .then (user) ->
    if user.count != 0
      res.status(500).send 'ACCOUNT ALREADY EXISTS'
    else
      createAccount req, res

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

