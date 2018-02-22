express = require 'express'
router = express.Router()
multer = require 'multer'
util = require '../tools/util'
util.setDateProto()
values = require '../tools/values'

imageStorage = multer.diskStorage {
  destination: (req, file, cb) ->
    cb null, '/home/ubuntu/apps/goodatme/image_server/storage/'
  filename: (req, file, cb) ->
    orgNameSplit = file.originalname.split('.')
    extension = orgNameSplit[orgNameSplit.length - 1]
    newName = "#{new Date().getTimedFileName()}-#{parseInt(99999-100000*Math.random())}.#{extension}"
    cb null, newName
}

router.post '/upload', multer({storage: imageStorage}).single('photo'), (req, res) ->
  if (values.imageForms.indexOf(req.file.mimetype) < 0)
    res.send {
      imageUrl: 'NOT IMAGE'
    }
  else
    res.send {
      imageUrl: req.file.filename
    }

module.exports = router
  