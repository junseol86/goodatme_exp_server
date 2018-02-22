var User, account, checkEmailExists, createAccount, express, router, sequaelize, util;

express = require('express');

router = express.Router();

sequaelize = require('../../secrets/database').getSql();

util = require('../tools/util');

account = require('../models/account');

User = account.user;

// 이메일 계정 존재 여부 확인
router.get('/checkEmailExists/:email', function(req, res) {
  return checkEmailExists(req, res, req.params.email, function(user) {
    return res.send({
      count: user.count
    });
  });
});

// 이메일 계정 존재 여부 확인 후 없으면 생성
router.post('/register', function(req, res) {
  return checkEmailExists(req, res, req.body.email, function(user) {
    if (user.count !== 0) {
      return res.status(500).send('ACCOUNT ALREADY EXISTS');
    } else {
      return createAccount(req, res);
    }
  });
});

// 이메일 계정 존재 여부 확인
checkEmailExists = function(req, res, email, func) {
  var user;
  return user = User.findAndCountAll({
    where: {
      email: email
    }
  }).then(func);
};


// 이메일 계정 생성
createAccount = function(req, res) {
  var hash, salt;
  salt = util.createSalt();
  hash = util.hashMD5(req.body.password + salt);
  return User.create({
    email: req.body.email,
    salt: salt,
    hash: hash
  }).then(function(savedUser) {
    return res.send(savedUser);
  });
};

module.exports = router;
