var express, imageStorage, multer, router, util, values;

express = require('express');

router = express.Router();

multer = require('multer');

util = require('../tools/util');

util.setDateProto();

values = require('../tools/values');

imageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, '/home/ubuntu/apps/goodatme/image_server/storage/');
  },
  filename: function(req, file, cb) {
    var extension, newName, orgNameSplit;
    orgNameSplit = file.originalname.split('.');
    extension = orgNameSplit[orgNameSplit.length - 1];
    newName = `${new Date().getTimedFileName()}-${parseInt(99999 - 100000 * Math.random())}.${extension}`;
    return cb(null, newName);
  }
});

router.post('/upload', multer({
  storage: imageStorage
}).single('photo'), function(req, res) {
  if (values.imageForms.indexOf(req.file.mimetype) < 0) {
    return res.send({
      imageUrl: 'NOT IMAGE'
    });
  } else {
    return res.send({
      imageUrl: req.file.filename
    });
  }
});

module.exports = router;
