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

# 포스팅 삭제
router.post '/delete', (req, res) ->
  dbwork.deletePosting(req, res)

# 포스팅 삭제
router.post '/modify', (req, res) ->
  dbwork.modifyPosting(req, res)

# 포스팅 목록
router.get '', (req, res) ->
  dbwork.postingList(req, res)

# 포스팅 하나
router.get '/:idx', (req, res) ->
  dbwork.postingSingle(req, res, req.params.idx)


# 포스팅 카테고리별
router.post '/category', (req, res) ->
  dbwork.postingsByCategory(req, res)

# 포스팅 카테고리별 대시보드
router.post '/top6', (req, res) ->
  dbwork.postingsTop6(req, res)

# 포스팅 달력형
router.post '/calendar', (req, res) ->
  dbwork.postingsByCalendar(req, res)

# 포스팅 무작위로 가져오기
router.post '/random', (req, res) ->
  dbwork.postingsByRandom(req, res)

# 포스팅 검색
router.post '/search', (req, res) ->
  dbwork.postingsBySearch(req, res)

dbwork = {
  # 포스팅 작성
  createPosting: (req, res) ->
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      Posting.create({
        user_idx: user.idx
        editor: user.nickname
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

  #포스팅 삭제
  deletePosting: (req, res) ->
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      if user.type != 'ADMIN'
        res.status(403).send '권한이 없습니다.'
      else
        Posting.destroy({where: {idx: req.body.posting_idx}})
        .then () ->
          res.send {
            account: account
          }

  #포스팅 수정
  modifyPosting: (req, res) ->
    account_dbwork.checkToken req, res, req.body.token, (account, user) ->
      if user.type != 'ADMIN'
        res.status(403).send '권한이 없습니다.'
      else
        Posting.update({
          user_idx: user.idx          
          editor: user.nickname
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
        }, {
          where: {
            idx: req.body.idx
            }
          }
        ).then () ->
          res.send account


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
      cond = "`shape` in ("
      subscs.map (it, idx) ->
        cond += (if idx == 0 then "'" else ", '") + it + "'"
      cond += ") DESC"
      order.push sequelize.literal cond      
    return order


  # eat, play, work 중 하나로 들어왔을 때 리스트
  postingsByCalendar: (req, res) ->
    _this = this
    order = _this.setOrder(req)
    order.unshift ['createdAt', 'DESC']
    Posting.findAll({
      order: order
      offset: parseInt req.body.offset * parseInt req.body.limit
      limit: parseInt req.body.limit
      })
    .then (postings) ->
      res.send postings

  # eat, play, work 중 하나로 들어왔을 때 리스트
  postingsByCategory: (req, res) ->
    _this = this
    where = if req.body.category != undefined then {category: req.body.category} else {}
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
      offset: parseInt req.body.offset * parseInt req.body.limit
      limit: parseInt req.body.limit
      })
    .then (postings) ->
      res.send postings

  # 대시보드 카테고리별 6개 포스팅
  postingsTop6: (req, res) ->
    _this = this
    where = {
      category: req.body.category
      importance: {
        $gt: 0
      }
    }
    order = _this.setOrder(req)
    Posting.findAll({
      where: where
      order: order
      offset: 0
      limit: 3
      })
    .then (postings) ->
      order = _this.setOrder(req)
      Posting.findAll({
        where: {
          category: req.body.category
          importance: 0
        },
        order: order
        offset: 0
        limit: 3
        })
      .then (postings2) ->
        postings = postings.concat postings2
        res.send postings

  # 무작위로 반환
  postingsByRandom: (req, res) ->
    _this = this
    Posting.findAll({
      order: sequelize.random()
      limit: parseInt req.body.limit
      })
    .then (postings) ->
      res.send postings

  # 검색어에 의해 반환
  postingsBySearch: (req, res) ->
    _this = this
    where = "
    category LIKE '%#{req.body.category}%' AND ("
    req.body.search.split(' ').map (keyword, idx) ->
      if idx != 0
        where += ") AND ("
      where += "
      rgn_do LIKE '%#{keyword}%'
      OR rgn_sgg LIKE '%#{keyword}%'
      OR rgn_emd LIKE '%#{keyword}%'
      OR place LIKE '%#{keyword}%'
      OR title LIKE '%#{keyword}%'
      OR brief LIKE '%#{keyword}%'
      OR hashtags LIKE '%#{keyword}%'
      "
    where += ")"
    Posting.findAll({
      where: sequelize.literal where
      order: sequelize.random()
      limit: parseInt req.body.limit
      offset: parseInt req.body.offset * parseInt req.body.limit
      })
    .then (postings) ->
      res.send postings
}

module.exports = {
  router: router
  dbwork: dbwork
}