express = require 'express'
router = express.Router()

router.use (req, res, next) ->
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")

  next()

router.get '/', (req, res) -> 
  res.send {
    message: 'EXPRESS SERVER BY HM'
  }

module.exports = router