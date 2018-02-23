exports.setDateProto = () ->
  Date.prototype.getTimeString = ->
    timeString = this.getFullYear() + "-"
    timeString += this.getMonth() + "-"
    timeString += this.getDate() + " "
    timeString += this.getHours() + ":"
    timeString += this.getMinutes() + ":"
    timeString += this.getSeconds()
    timeString

  Date.prototype.getTimedFileName = ->
    timeString = this.getFullYear() + "-"
    timeString += this.getMonth() + "-"
    timeString += this.getDate() + "_"
    timeString += this.getHours() + "-"
    timeString += this.getMinutes() + "-"
    timeString += this.getSeconds()
    timeString

randomChars = (length) ->
  result = ""
  letterSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for [0..length - 1]
    result = result += letterSet[Math.floor(Math.random() * letterSet.length)]
  result

exports.createSalt = () ->
  randomChars(20)

exports.createToken = () ->
  randomChars(40)

exports.hashMD5 = (str) ->
  md5 = require('md5')
  return md5(str)
