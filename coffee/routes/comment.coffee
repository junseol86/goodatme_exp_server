express = require 'express'
router = express.Router()
Sequelize = require 'sequelize'
Op = Sequelize.Op
sequelize = require('../../secrets/database').getSql()
util = require '../tools/util'
comment = require '../models/comment'
account_dbwork = require('./account').dbwork

Comment = comment.comment

#리스트 받기
router.post '/list', (req, res) ->
  if req.body.token == undefined
    dbwork.list req, res
  else
    dbwork.list req, res, req.body.token

#댓글 작성
router.post '/write', (req, res) ->
  dbwork.write req, res

#댓글 삭제
router.post '/delete', (req, res) ->
  dbwork.delete req, res

dbwork = {
#리스트 받기
  list: (req, res, token) ->
    Comment.findAll({
      where: {
        posting_idx: req.body.posting_idx
      }
      order: [['createdAt', 'DESC']]
    })
    .then (comments) ->
      if token == undefined
        res.send {
          comments: comments
        }
      else
        account_dbwork.checkToken req, res, token, (account, user) ->
          result = []
          comments.map (it) ->
            if it.user_idx == user.idx
              it.dataValues.mine = true
            result.push it
          res.send {
            comments: result
            account: account
          }

  #댓글 작성
  write: (req, res) ->
    _this = this
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      Comment.create({
        posting_idx: req.body.posting_idx
        user_idx: user.idx
        user_nickname: user.nickname
        content: req.body.content
      })
      .then () ->
        _this.list req, res, account.token

  #댓글 삭제
  delete: (req, res) ->
    _this = this
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      Comment.destroy({
        where: {
          idx: req.body.comment_idx
          user_idx: user.idx
        }
      })
      .then () ->
        _this.list req, res, account.token
}

module.exports = {
  router: router
  dbwork: dbwork
}