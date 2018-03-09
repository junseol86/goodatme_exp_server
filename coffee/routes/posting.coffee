express = require 'express'
router = express.Router()
Sequelize = require 'sequelize'
Op = Sequelize.Op
sequelize = require('../../secrets/database').getSql()
account_dbwork = require('./account').dbwork
posting = require '../models/posting'
Posting = posting.posting

# 포스팅 작성
router.post '/posting', (req, res) ->
  dbwork.createPosting(req, res)

# 포스팅 목록
router.get '/posting', (req, res) ->
  dbwork.postingList(req, res)

# 포스팅 하나
router.get '/posting/:idx', (req, res) ->
  dbwork.postingSingle(req, res, req.params.idx)

dbwork = {
  # 포스팅 작성
  createPosting: (req, res) ->
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      Posting.create({
        user_idx: user.idx
        category: req.body.category
        sub_category: req.body.sub_category
        rgn_do: req.body.rgn_do
        rgn_sgg: req.body.rgn_sgg
        rgn_emd: req.body.rgn_emd
        rgn_ri: req.body.rgn_ri
        shape: req.body.shape
        color_r: req.body.color_r
        color_g: req.body.color_g
        color_b: req.body.color_b
        place: req.body.place
        title: req.body.title
        brief: req.body.brief
        content: req.body.content
        image: req.body.image
        hashtags: req.body.hashtags
        importance: req.body.importance
      }).then (savedPosting) ->
        res.send {
          postingIdx: savedPosting.idx
          account: account
        }

  # 포스팅 목록
  postingList: (req, res) ->
    Posting.findAll({
      limit: 5
      order: [
        ['idx', 'DESC']
      ]
      })
    .then (postings) ->
      res.send postings

  postingSingle: (req, res, idx) ->
    Posting.findOne({
      where: {idx: idx}
    }).then (posting) ->
      account_dbwork.checkUserIdxExists req, res, posting.user_idx, (users) ->
        writer = if users.count == '' then '(삭제된 사용자)' else users.rows[0].nickname
        res.send {
          writer: writer
          posting: posting
        }
}

module.exports = {
  router: router
  dbwork: dbwork
}