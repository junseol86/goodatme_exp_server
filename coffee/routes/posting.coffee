express = require 'express'
router = express.Router()
Sequelize = require 'sequelize'
Op = Sequelize.Op
sequelize = require('../../secrets/database').getSql()
_ = require 'lodash'
account_dbwork = require('./account').dbwork
posting = require '../models/posting'
Posting = posting.posting

# 포스팅 작성
router.post '', (req, res) ->
  dbwork.createPosting(req, res)

# 포스팅 목록
router.get '', (req, res) ->
  dbwork.postingList(req, res)

# 포스팅 하나
router.get '/:idx', (req, res) ->
  dbwork.postingSingle(req, res, req.params.idx)


# 포스팅 목록
router.post '/category', (req, res) ->
  dbwork.postingsByCategory(req, res)

# 포스팅 목록
router.post '/calendar', (req, res) ->
  dbwork.postingsByCalendar(req, res)

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

  # 모양, 색, 구독정보가 있는 사용자부터
  setOrder: (req) ->
    # 대시보드 상단 슬라이드 또는 카테고리별 대표 6 포스팅일 경우
    order = []
    if req.body.importance != undefined
      if req.body.importance > 0
        order.push ['importance', 'DESC']
      if req.body.importance < 0
        order.push ['importance', 'ASC']
    # 같은 모양이면 가장 먼저
    if req.body.shape != undefined
      order.push sequelize.literal "FIELD(shape, '#{req.body.shape}') DESC"
    # 색의 차이가 적은 것부터
    if req.body.color_r != undefined && req.body.color_g != undefined && req.body.color_b != undefined
      order.push sequelize.literal "
      (ABS(color_r - #{req.body.color_r}) + ABS(color_g - #{req.body.color_g}) + ABS(color_b - #{req.body.color_b})) ASC
      "
    # 구독중인 것부터
    if req.body.shape_sbsc != undefined
      cond = ""
      subscs = req.body.shape_sbsc.split(',')
      shuffled = _.shuffle subscs
      shuffled.map (shape, idx) ->
        if (shape != '')
          if (idx != 0)
            cond += ','
          cond += "'#{shape}'"
      order.push sequelize.literal "FIELD(shape, #{cond}) DESC"
    return order


  # eat, play, work 중 하나로 들어왔을 때 리스트
  postingsByCalendar: (req, res) ->
    _this = this
    order = _this.setOrder(req)
    order.unshift ['createdAt', 'DESC']
    Posting.findAll({
     order: order
      })
    .then (postings) ->
      res.send postings

  # eat, play, work 중 하나로 들어왔을 때 리스트
  postingsByCategory: (req, res) ->
    _this = this
    where = {category: req.body.category}
    if req.body.importance != undefined
      if req.body.importance > 0
        where.importance = {
          $gt: 0
        }
      if req.body.importance < 0
        where.importance = {
          $lt: 0
        }
    order = _this.setOrder(req)
    Posting.findAll({
      where: where
      order: order
      })
    .then (postings) ->
      res.send postings
}

module.exports = {
  router: router
  dbwork: dbwork
}