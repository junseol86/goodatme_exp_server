express = require 'express'
router = express.Router()
Sequelize = require 'sequelize'
Op = Sequelize.Op
sequelize = require('../../secrets/database').getSql()

question = require '../models/question'
Question = question.question

# 설문 목록
router.get '/question', (req, res) ->
  dbwork.questionList(req, res)

dbwork = {
  # 포스팅 목록
  questionList: (req, res) ->
    Question.findAll({
      where: {active: 1}
      order: sequelize.random()
      })
    .then (postings) ->
      res.send postings
}

module.exports = {
  router: router
  dbwork: dbwork
}