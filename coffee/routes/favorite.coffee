express = require 'express'
router = express.Router()
Sequelize = require 'sequelize'
Op = Sequelize.Op
sequelize = require('../../secrets/database').getSql()
util = require '../tools/util'
favorite = require '../models/favorite'
posting = require '../models/posting'
account_dbwork = require('./account').dbwork
Favorite = favorite.favorite
Posting = posting.posting

Favorite.hasMany Posting, {
  foreignKey: 'idx'
  sourceKey: 'posting_idx'
  }
Posting.belongsTo Favorite, {
  foreignKey: 'idx'
  targetKey: 'posting_idx'
  }

#유저의 favorite 목록 가져오기
router.post '/list', (req, res) ->
  dbwork.list req, res

# 특정 게시물에 특정 사용자의 좋아요 토글
router.put '/toggle', (req, res) ->
  dbwork.toggle req, res

dbwork = {
  #유저의 favorite 목록 가져오기
  list: (req, res) ->
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      Favorite.findAll({
        where: {
          user_idx: user.idx
        } 
        include : [Posting]       
      })
      .then (favorites) ->
        res.send {
          account: account
          favorites: favorites
        }

  # 특정 게시물에 특정 사용자의 좋아요 토글
  toggle: (req, res) ->
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      favorite = Favorite.findAndCountAll({
        where: {
          user_idx: user.idx
          posting_idx: req.body.posting_idx
          }
        })
        .then (favorites) ->
          if favorites.count == 0
            Favorite.create({
              user_idx: user.idx
              posting_idx: req.body.posting_idx
            }).then () ->
              favorite = Favorite.findAndCountAll({
                where: {
                  user_idx: user.idx
                  posting_idx: req.body.posting_idx
                  }
                })
                .then (favorites) ->
                  res.send {
                    account: account
                    count: favorites.count
                  }
          else
            Favorite.destroy({
              where: {
                user_idx: user.idx
                posting_idx: req.body.posting_idx
                }
            }).then () ->
              favorite = Favorite.findAndCountAll({
                where: {
                  user_idx: user.idx
                  posting_idx: req.body.posting_idx
                  }
                })
                .then (favorites) ->
                  res.send {
                    account: account
                    count: favorites.count
                  }
}

module.exports = {
  router: router
  dbwork: dbwork
}