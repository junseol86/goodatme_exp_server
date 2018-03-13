express = require 'express'
router = express.Router()
Sequelize = require 'sequelize'
Op = Sequelize.Op
sequelize = require('../../secrets/database').getSql()
util = require '../tools/util'
account = require '../models/account'
User = account.user
Token = account.token

# 이메일 계정 존재 여부 확인
router.get '/checkEmailExists/:email', (req, res) ->
  dbwork.checkEmailExists req, res, req.params.email, (users) ->
    res.send users

# 이메일 계정 존재 여부 확인 후 없으면 생성
router.post '/register', (req, res) ->
  dbwork.checkEmailExists req, res, req.body.email, (users) ->
    if users.count != 0
      res.status(500).send 'ACCOUNT ALREADY EXISTS'
    else
      dbwork.createAccount req, res

# 로그인 - 이메일과 비밀번호 확인
router.get '/login', (req, res) ->
  dbwork.login req, res

# 토큰으로 접근
router.get '/access', (req, res) ->
  dbwork.checkToken req, res, req.get('token'), (account, user) ->
    res.send account

#유저 모양 변경
router.put '/shape', (req, res) ->
  dbwork.updateShape req, res

#유저 색 변경
router.put '/color', (req, res) ->
  dbwork.updateColor req, res

dbwork = {

  # 인덱스 계정 존재 여부 확인
  checkUserIdxExists: (req, res, idx, func) ->
    user = User.findAndCountAll({where: {idx: idx}})
    .then func 

  # 이메일 계정 존재 여부 확인
  checkEmailExists: (req, res, email, func) ->
    user = User.findAndCountAll({where: {email: email}})
    .then func 

  # 이메일 계정 생성
  createAccount: (req, res) ->
    salt = util.createSalt()
    hash = util.hashMD5(req.body.password + salt)
    User.create({
      email: req.body.email
      nickname: req.body.nickname
      salt: salt
      hash: hash
    }).then (savedUser) ->
      res.send savedUser

  # 로그인 - 이메일과 비밀번호 확인
  login: (req, res) ->
    _this = this
    _this.checkEmailExists req, res, req.get('email'), (users) ->
      # 아이디가 없을 경우
      if  users.count == 0
        res.status(403).send '이메일을 확인해 주세요.'
      else
        user = users.rows[0]
        # 비밀번호가 틀렸을 경우
        if util.hashMD5(req.get('password') + user.salt) != user.hash
          res.status(403).send '패스워드를 확인해 주세요.'
        # 토큰 생성
        else
          _this.refreshToken req, res, user, (token) ->
            res.send _this.accountToReturn user, token

  # 토큰 삭제
  removeToken: (req, res, user, func) ->
    Token.destroy({where: {user_idx: user.idx}})
    .then func

  # 반환할 유저정보와 토큰
  accountToReturn: (user, token) ->
    {
      account: {
        email: user.email
        nickname: user.nickname
        type: user.type
        shape: user.shape
        shape_sbsc: user.shape_sbsc
        color_str: user.color_str
        color_r: user.color_r
        color_g: user.color_g
        color_b: user.color_b
      }
      token: token.token
    }

  # 토큰 생성
  refreshToken: (req, res, user, func) ->
    _this = this
    # 해당 아이디의 토큰 삭제
    _this.removeToken req, res, user, () ->
      # 토큰 생성 후 반환
      Token.create({
        user_idx: user.idx
        token: util.createToken()
      }).then func

  # 토큰을 확인하여 갱신하고 사용자 정보를 획득한 뒤 주어진 함수 실행
  checkToken: (req, res, token, func) ->
    _this = this
    Token.findAndCountAll({
      where: {
        token: token
        createdAt: {[Op.gt] : (util.dateBefore 7)}
      }
    }).then (tokens) ->
      # 토큰이 없을 시
      if tokens.count == 0
        res.status(403).send "다시 로그인해주세요."
      else
        token = tokens.rows[0]
        _this.checkUserIdxExists req, res, token.user_idx, (users) ->
          # 해당 사용자가 없을 때
          if users.count == 0
            res.status(403).send "다시 로그인해주세요."
          else 
            user = users.rows[0]
            _this.refreshToken req, res, user, (token) ->
              account = _this.accountToReturn user, token
              # 주어진 함수 실행
              func(account, user)

  #유저 모양 변경
  updateShape: (req, res) ->
    _this = this
    _this.checkToken req, res, req.body.token, (account, user) ->
      User.update({
        shape: req.body.shape
      }, {
        where: {
          idx: user.idx
        }
      }).then () ->
        _this.checkToken req, res, account.token, (account, user) ->
          res.send account

  #유저 색 변경
  updateColor: (req, res) ->
    _this = this
    _this.checkToken req, res, req.body.token, (account, user) ->
      User.update({
        color_str: req.body.color_str,
        color_r: req.body.color_r,
        color_g: req.body.color_g,
        color_b: req.body.color_b
      }, {
        where: {
          idx: user.idx
        }
      }).then () ->
        _this.checkToken req, res, account.token, (account, user) ->
          res.send account
}

module.exports = {
  router: router
  dbwork: dbwork
}

