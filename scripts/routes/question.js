var Op, Question, Sequelize, dbwork, express, question, router, sequelize;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequelize = require('../../secrets/database').getSql();

question = require('../models/question');

Question = question.question;

// 설문 목록
router.get('/question', function(req, res) {
  return dbwork.questionList(req, res);
});

dbwork = {
  // 포스팅 목록
  questionList: function(req, res) {
    return Question.findAll({
      where: {
        active: 1
      },
      order: sequelize.random()
    }).then(function(postings) {
      return res.send(postings);
    });
  }
};

module.exports = {
  router: router,
  dbwork: dbwork
};
