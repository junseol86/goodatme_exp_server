var express, router;

express = require('express');

router = express.Router();

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "email,password,token,hd1,hd2,hd3,hd4,hd5");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  return next();
});

router.get('/', function(req, res) {
  return res.send({
    message: 'EXPRESS SERVER BY HM'
  });
});

module.exports = router;
