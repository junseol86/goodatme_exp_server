express = require 'express'
router = express.Router()

router.use (req, res, next) ->
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "email,password,token,hd1,hd2,hd3,hd4,hd5")
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")

  next()

router.get '/', (req, res) -> 
  res.send {
    message: 'EXPRESS SERVER BY HM'
  }

module.exports = router