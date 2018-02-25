var Op, Sequelize, Token, User, account, accountToReturn, checkEmailExists, checkToken, createAccount, createToken, express, login, removeToken, router, sequaelize, util;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequaelize = require('../../secrets/database').getSql();

util = require('../tools/util');

account = require('../models/account');

User = account.user;

Token = account.token;

// 이메일 계정 존재 여부 확인
router.get('/checkEmailExists/:email', function(req, res) {
  return checkEmailExists(req, res, req.params.email, function(users) {
    return res.send({
      count: users.count
    });
  });
});

// 이메일 계정 존재 여부 확인 후 없으면 생성
router.post('/register', function(req, res) {
  return checkEmailExists(req, res, req.body.email, function(users) {
    if (users.count !== 0) {
      return res.status(500).send('ACCOUNT ALREADY EXISTS');
    } else {
      return createAccount(req, res);
    }
  });
});

// 이메일 계정 존재 여부 확인
router.get('/login', function(req, res) {
  return login(req, res);
});

// 토큰으로 접근
router.get('/access', function(req, res) {
  return checkToken(req, res);
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
    nickname: req.body.nickname,
    salt: salt,
    hash: hash
  }).then(function(savedUser) {
    return res.send(savedUser);
  });
};

// 로그인 - 이메일과 비밀번호 확인
login = function(req, res) {
  return checkEmailExists(req, res, req.get('email'), function(users) {
    var user;
    // 아이디가 없을 경우
    if (users.count === 0) {
      return res.status(403).send('LOGIN FAILED');
    } else {
      user = users.rows[0];
      // 비밀번호가 틀렸을 경우
      if (util.hashMD5(req.get('password') + user.salt) !== user.hash) {
        return res.status(403).send('LOGIN FAILED');
      } else {
        // 토큰 생성
        return createToken(req, res, user);
      }
    }
  });
};

// 토큰 삭제
removeToken = function(req, res, user, func) {
  return Token.destroy({
    where: {
      user_idx: user.idx
    }
  }).then(func);
};

// 반환할 유저정보와 토큰
accountToReturn = function(user, token) {
  return {
    email: user.email,
    nickname: user.nickname,
    type: user.type,
    shape: user.shape,
    color_str: user.color_str,
    color_r: user.color_r,
    color_g: user.color_g,
    color_b: user.color_b,
    token: token.token
  };
};

// 토큰 생성
createToken = function(req, res, user) {
  // 해당 아이디의 토큰 삭제
  return removeToken(req, res, user, function() {
    // 토큰 생성 후 반환
    return Token.create({
      user_idx: user.idx,
      token: util.createToken()
    }).then(function(token) {
      return res.send(accountToReturn(user, token));
    });
  });
};

// 토큰 유효 확인
checkToken = function(req, res) {
  return Token.findAndCountAll({
    where: {
      token: req.get('token'),
      createdAt: {
        [Op.gt]: util.dateBefore(7)
      }
    }
  }).then(function(tokens) {
    return res.send(tokens);
  });
};

module.exports = router;
