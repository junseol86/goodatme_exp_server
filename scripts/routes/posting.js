var Op, Posting, Sequelize, account_dbwork, dbwork, express, posting, router, sequelize;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequelize = require('../../secrets/database').getSql();

account_dbwork = require('./account').dbwork;

posting = require('../models/posting');

Posting = posting.posting;

// 포스팅 작성
router.post('/posting', function(req, res) {
  return dbwork.createPosting(req, res);
});

// 포스팅 목록
router.get('/posting', function(req, res) {
  return dbwork.postingList(req, res);
});

// 포스팅 하나
router.get('/posting/:idx', function(req, res) {
  return dbwork.postingSingle(req, res, req.params.idx);
});

dbwork = {
  // 포스팅 작성
  createPosting: function(req, res) {
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      return Posting.create({
        user_idx: user.idx,
        category: req.body.category,
        sub_category: req.body.sub_category,
        rgn_do: req.body.rgn_do,
        rgn_sgg: req.body.rgn_sgg,
        rgn_emd: req.body.rgn_emd,
        rgn_ri: req.body.rgn_ri,
        shape: req.body.shape,
        color_r: req.body.color_r,
        color_g: req.body.color_g,
        color_b: req.body.color_b,
        place: req.body.place,
        title: req.body.title,
        brief: req.body.brief,
        content: req.body.content,
        image: req.body.image,
        hashtags: req.body.hashtags,
        importance: req.body.importance
      }).then(function(savedPosting) {
        return res.send({
          postingIdx: savedPosting.idx,
          account: account
        });
      });
    });
  },
  // 포스팅 목록
  postingList: function(req, res) {
    return Posting.findAll({
      limit: 5,
      order: [['idx', 'DESC']]
    }).then(function(postings) {
      return res.send(postings);
    });
  },
  postingSingle: function(req, res, idx) {
    return Posting.findOne({
      where: {
        idx: idx
      }
    }).then(function(posting) {
      return account_dbwork.checkUserIdxExists(req, res, posting.user_idx, function(users) {
        var writer;
        writer = users.count === '' ? '(삭제된 사용자)' : users.rows[0].nickname;
        return res.send({
          writer: writer,
          posting: posting
        });
      });
    });
  }
};

module.exports = {
  router: router,
  dbwork: dbwork
};
