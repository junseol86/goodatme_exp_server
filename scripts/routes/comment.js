var Comment, Op, Sequelize, account_dbwork, comment, dbwork, express, router, sequelize, util;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequelize = require('../../secrets/database').getSql();

util = require('../tools/util');

comment = require('../models/comment');

account_dbwork = require('./account').dbwork;

Comment = comment.comment;

//리스트 받기
router.post('/list', function(req, res) {
  if (req.body.token === void 0) {
    return dbwork.list(req, res);
  } else {
    return dbwork.list(req, res, req.body.token);
  }
});

//댓글 작성
router.post('/write', function(req, res) {
  return dbwork.write(req, res);
});

//댓글 삭제
router.post('/delete', function(req, res) {
  return dbwork.delete(req, res);
});

dbwork = {
  //리스트 받기
  list: function(req, res, token) {
    return Comment.findAll({
      where: {
        posting_idx: req.body.posting_idx
      },
      order: [['createdAt', 'DESC']]
    }).then(function(comments) {
      if (token === void 0) {
        return res.send({
          comments: comments
        });
      } else {
        return account_dbwork.checkToken(req, res, token, function(account, user) {
          var result;
          result = [];
          comments.map(function(it) {
            if (it.user_idx === user.idx) {
              it.dataValues.mine = true;
            }
            return result.push(it);
          });
          return res.send({
            comments: result,
            account: account
          });
        });
      }
    });
  },
  //댓글 작성
  write: function(req, res) {
    var _this;
    _this = this;
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      return Comment.create({
        posting_idx: req.body.posting_idx,
        user_idx: user.idx,
        user_nickname: user.nickname,
        content: req.body.content
      }).then(function() {
        return _this.list(req, res, account.token);
      });
    });
  },
  //댓글 삭제
  delete: function(req, res) {
    var _this;
    _this = this;
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      return Comment.destroy({
        where: {
          idx: req.body.comment_idx,
          user_idx: user.idx
        }
      }).then(function() {
        return _this.list(req, res, account.token);
      });
    });
  }
};

module.exports = {
  router: router,
  dbwork: dbwork
};
