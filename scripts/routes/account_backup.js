var Op, Sequelize, Token, User, account, accountToReturn, checkEmailExists, checkToken, checkUserIdxExists, createAccount, express, login, refreshToken, removeToken, router, sequelize, util;

express = require('express');

router = express.Router();

Sequelize = require('sequelize');

Op = Sequelize.Op;

sequelize = require('../../secrets/database').getSql();

util = require('../tools/util');

account = require('../models/account');

User = account.user;

Token = account.token;

// 이메일 계정 존재 여부 확인
router.get('/checkEmailExists/:email', function(req, res) {
  return checkEmailExists(req, res, req.params.email, function(users) {
    return res.send(users);
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

// 로그인 - 이메일과 비밀번호 확인
router.get('/login', function(req, res) {
  return login(req, res);
});

// 토큰으로 접근
router.get('/access', function(req, res) {
  return checkToken(req, res, req.get('token'), function(account, user) {
    return res.send(account);
  });
});

// 인덱스 계정 존재 여부 확인
checkUserIdxExists = function(req, res, idx, func) {
  var user;
  return user = User.findAndCountAll({
    where: {
      idx: idx
    }
  }).then(func);
};


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
      return res.status(403).send('이메일을 확인해 주세요.');
    } else {
      user = users.rows[0];
      // 비밀번호가 틀렸을 경우
      if (util.hashMD5(req.get('password') + user.salt) !== user.hash) {
        return res.status(403).send('패스워드를 확인해 주세요.');
      } else {
        // 토큰 생성
        return refreshToken(req, res, user, function(token) {
          return res.send(accountToReturn(user, token));
        });
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
    account: {
      email: user.email,
      nickname: user.nickname,
      type: user.type,
      shape: user.shape,
      color_str: user.color_str,
      color_r: user.color_r,
      color_g: user.color_g,
      color_b: user.color_b
    },
    token: token.token
  };
};

// 토큰 생성
refreshToken = function(req, res, user, func) {
  // 해당 아이디의 토큰 삭제
  return removeToken(req, res, user, function() {
    // 토큰 생성 후 반환
    return Token.create({
      user_idx: user.idx,
      token: util.createToken()
    }).then(func);
  });
};

// 토큰을 확인하여 갱신하고 사용자 정보를 획득한 뒤 주어진 함수 실행
checkToken = function(req, res, token, func) {
  return Token.findAndCountAll({
    where: {
      token: token,
      createdAt: {
        [Op.gt]: util.dateBefore(7)
      }
    }
  }).then(function(tokens) {
    // 토큰이 없을 시
    if (tokens.count === 0) {
      return res.status(403).send("다시 로그인해주세요.");
    } else {
      token = tokens.rows[0];
      return checkUserIdxExists(req, res, token.user_idx, function(users) {
        var user;
        // 해당 사용자가 없을 때
        if (users.count === 0) {
          return res.status(403).send("다시 로그인해주세요.");
        } else {
          user = users.rows[0];
          return refreshToken(req, res, user, function(token) {
            account = accountToReturn(user, token);
            // 주어진 함수 실행
            return func(account, user);
          });
        }
      });
    }
  });
};

module.exports = router;
