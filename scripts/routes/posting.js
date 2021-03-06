var Op, Posting, Sequelize, _, account_dbwork, dbwork, express, posting, router, sequelize;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequelize = require('../../secrets/database').getSql();

_ = require('lodash');

account_dbwork = require('./account').dbwork;

posting = require('../models/posting');

Posting = posting.posting;

// 포스팅 작성
router.post('', function(req, res) {
  return dbwork.createPosting(req, res);
});

// 포스팅 삭제
router.post('/delete', function(req, res) {
  return dbwork.deletePosting(req, res);
});

// 포스팅 삭제
router.post('/modify', function(req, res) {
  return dbwork.modifyPosting(req, res);
});

// 포스팅 목록
router.get('', function(req, res) {
  return dbwork.postingList(req, res);
});

// 포스팅 하나
router.get('/:idx', function(req, res) {
  return dbwork.postingSingle(req, res, req.params.idx);
});

// 포스팅 카테고리별
router.post('/category', function(req, res) {
  return dbwork.postingsByCategory(req, res);
});

// 포스팅 카테고리별 대시보드
router.post('/top6', function(req, res) {
  return dbwork.postingsTop6(req, res);
});

// 포스팅 달력형
router.post('/calendar', function(req, res) {
  return dbwork.postingsByCalendar(req, res);
});

// 포스팅 무작위로 가져오기
router.post('/random', function(req, res) {
  return dbwork.postingsByRandom(req, res);
});

// 포스팅 검색
router.post('/search', function(req, res) {
  return dbwork.postingsBySearch(req, res);
});

dbwork = {
  // 포스팅 작성
  createPosting: function(req, res) {
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      return Posting.create({
        user_idx: user.idx,
        editor: user.nickname,
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
  //포스팅 삭제
  deletePosting: function(req, res) {
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      if (user.type !== 'ADMIN') {
        return res.status(403).send('권한이 없습니다.');
      } else {
        return Posting.destroy({
          where: {
            idx: req.body.posting_idx
          }
        }).then(function() {
          return res.send({
            account: account
          });
        });
      }
    });
  },
  //포스팅 수정
  modifyPosting: function(req, res) {
    return account_dbwork.checkToken(req, res, req.body.token, function(account, user) {
      if (user.type !== 'ADMIN') {
        return res.status(403).send('권한이 없습니다.');
      } else {
        return Posting.update({
          user_idx: user.idx,
          editor: user.nickname,
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
        }, {
          where: {
            idx: req.body.idx
          }
        }).then(function() {
          return res.send(account);
        });
      }
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
  },
  // 모양, 색, 구독정보가 있는 사용자부터
  setOrder: function(req) {
    var cond, order, subscs;
    // 대시보드 상단 슬라이드 또는 카테고리별 대표 6 포스팅일 경우
    order = [];
    if (req.body.importance !== void 0) {
      if (req.body.importance > 0) {
        order.push(['importance', 'DESC']);
      }
      if (req.body.importance < 0) {
        order.push(['importance', 'ASC']);
      }
    }
    // 같은 모양이면 가장 먼저
    if (req.body.shape !== void 0) {
      order.push(sequelize.literal(`FIELD(shape, '${req.body.shape}') DESC`));
    }
    // 색의 차이가 적은 것부터
    if (req.body.color_r !== void 0 && req.body.color_g !== void 0 && req.body.color_b !== void 0) {
      order.push(sequelize.literal(`(ABS(color_r - ${req.body.color_r}) + ABS(color_g - ${req.body.color_g}) + ABS(color_b - ${req.body.color_b})) ASC`));
    }
    // 구독중인 것부터
    if (req.body.shape_sbsc !== void 0) {
      cond = "";
      subscs = req.body.shape_sbsc.split(',');
      cond = "`shape` in (";
      subscs.map(function(it, idx) {
        return cond += (idx === 0 ? "'" : ", '") + it + "'";
      });
      cond += ") DESC";
      order.push(sequelize.literal(cond));
    }
    return order;
  },
  // eat, play, work 중 하나로 들어왔을 때 리스트
  postingsByCalendar: function(req, res) {
    var _this, order;
    _this = this;
    order = _this.setOrder(req);
    order.unshift(['createdAt', 'DESC']);
    return Posting.findAll({
      order: order,
      offset: parseInt(req.body.offset * parseInt(req.body.limit)),
      limit: parseInt(req.body.limit)
    }).then(function(postings) {
      return res.send(postings);
    });
  },
  // eat, play, work 중 하나로 들어왔을 때 리스트
  postingsByCategory: function(req, res) {
    var _this, order, where;
    _this = this;
    where = req.body.category !== void 0 ? {
      category: req.body.category
    } : {};
    if (req.body.importance !== void 0) {
      if (req.body.importance > 0) {
        where.importance = {
          $gt: 0
        };
      }
      if (req.body.importance < 0) {
        where.importance = {
          $lt: 0
        };
      }
    }
    order = _this.setOrder(req);
    return Posting.findAll({
      where: where,
      order: order,
      offset: parseInt(req.body.offset * parseInt(req.body.limit)),
      limit: parseInt(req.body.limit)
    }).then(function(postings) {
      return res.send(postings);
    });
  },
  // 대시보드 카테고리별 6개 포스팅
  postingsTop6: function(req, res) {
    var _this, order, where;
    _this = this;
    where = {
      category: req.body.category,
      importance: {
        $gt: 0
      }
    };
    order = _this.setOrder(req);
    return Posting.findAll({
      where: where,
      order: order,
      offset: 0,
      limit: 3
    }).then(function(postings) {
      order = _this.setOrder(req);
      return Posting.findAll({
        where: {
          category: req.body.category,
          importance: 0
        },
        order: order,
        offset: 0,
        limit: 3
      }).then(function(postings2) {
        postings = postings.concat(postings2);
        return res.send(postings);
      });
    });
  },
  // 무작위로 반환
  postingsByRandom: function(req, res) {
    var _this;
    _this = this;
    return Posting.findAll({
      order: sequelize.random(),
      limit: parseInt(req.body.limit)
    }).then(function(postings) {
      return res.send(postings);
    });
  },
  // 검색어에 의해 반환
  postingsBySearch: function(req, res) {
    var _this, where;
    _this = this;
    where = `category LIKE '%${req.body.category}%' AND (`;
    req.body.search.split(' ').map(function(keyword, idx) {
      if (idx !== 0) {
        where += ") AND (";
      }
      return where += `rgn_do LIKE '%${keyword}%' OR rgn_sgg LIKE '%${keyword}%' OR rgn_emd LIKE '%${keyword}%' OR place LIKE '%${keyword}%' OR title LIKE '%${keyword}%' OR brief LIKE '%${keyword}%' OR hashtags LIKE '%${keyword}%'`;
    });
    where += ")";
    return Posting.findAll({
      where: sequelize.literal(where),
      order: sequelize.random(),
      limit: parseInt(req.body.limit),
      offset: parseInt(req.body.offset * parseInt(req.body.limit))
    }).then(function(postings) {
      return res.send(postings);
    });
  }
};

module.exports = {
  router: router,
  dbwork: dbwork
};
