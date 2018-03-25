var Favorite, Op, Posting, Sequelize, account_dbwork, dbwork, express, favorite, posting, router, sequelize, util;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequelize = require('../../secrets/database').getSql();

util = require('../tools/util');

favorite = require('../models/favorite');

posting = require('../models/posting');

account_dbwork = require('./account').dbwork;

Favorite = favorite.favorite;

Posting = posting.posting;

Favorite.hasMany(Posting, {
  foreignKey: 'idx',
  sourceKey: 'posting_idx'
});

Posting.belongsTo(Favorite, {
  foreignKey: 'idx',
  targetKey: 'posting_idx'
});

//유저의 favorite 목록 가져오기
router.post('/list', function(req, res) {
  return dbwork.list(req, res);
});

// 특정 게시물에 특정 사용자의 좋아요 토글
router.put('/toggle', function(req, res) {
  return dbwork.toggle(req, res);
});

dbwork = {
  //유저의 favorite 목록 가져오기
  list: function(req, res) {
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      return Favorite.findAll({
        where: {
          user_idx: user.idx
        },
        include: [Posting]
      }).then(function(favorites) {
        return res.send({
          account: account,
          favorites: favorites
        });
      });
    });
  },
  // 특정 게시물에 특정 사용자의 좋아요 토글
  toggle: function(req, res) {
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      return favorite = Favorite.findAndCountAll({
        where: {
          user_idx: user.idx,
          posting_idx: req.body.posting_idx
        }
      }).then(function(favorites) {
        if (favorites.count === 0) {
          return Favorite.create({
            user_idx: user.idx,
            posting_idx: req.body.posting_idx
          }).then(function() {
            return favorite = Favorite.findAndCountAll({
              where: {
                user_idx: user.idx,
                posting_idx: req.body.posting_idx
              }
            }).then(function(favorites) {
              return res.send({
                account: account,
                count: favorites.count
              });
            });
          });
        } else {
          return Favorite.destroy({
            where: {
              user_idx: user.idx,
              posting_idx: req.body.posting_idx
            }
          }).then(function() {
            return favorite = Favorite.findAndCountAll({
              where: {
                user_idx: user.idx,
                posting_idx: req.body.posting_idx
              }
            }).then(function(favorites) {
              return res.send({
                account: account,
                count: favorites.count
              });
            });
          });
        }
      });
    });
  }
};

module.exports = {
  router: router,
  dbwork: dbwork
};
