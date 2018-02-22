var express, router;

express = require('express');

router = express.Router();

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  return next();
});

router.get('/', function(req, res) {
  return res.send({
    message: 'EXPRESS SERVER BY HM'
  });
});

module.exports = router;
