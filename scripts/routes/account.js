var User, account, checkEmailExists, createAccount, express, router, sequaelize, util;

express = require('express');

router = express.Router();

sequaelize = require('../../secrets/database').getSql();

util = require('../tools/util');

account = require('../models/account');

User = account.user;

router.post('/register', function(req, res) {
  return checkEmailExists(req, res);
});

checkEmailExists = function(req, res) {
  var email, user;
  email = req.body.email;
  return user = User.findAndCountAll({
    where: {
      email: email
    }
  }).then(function(user) {
    if (user.count !== 0) {
      return res.status(500).send('ACCOUNT ALREADY EXISTS');
    } else {
      return createAccount(req, res);
    }
  });
};

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
