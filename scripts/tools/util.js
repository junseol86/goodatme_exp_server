exports.setDateProto = function() {
  Date.prototype.getTimeString = function() {
    var timeString;
    timeString = this.getFullYear() + "-";
    timeString += this.getMonth() + "-";
    timeString += this.getDate() + " ";
    timeString += this.getHours() + ":";
    timeString += this.getMinutes() + ":";
    timeString += this.getSeconds();
    return timeString;
  };
  return Date.prototype.getTimedFileName = function() {
    var timeString;
    timeString = this.getFullYear() + "-";
    timeString += this.getMonth() + "-";
    timeString += this.getDate() + "_";
    timeString += this.getHours() + "-";
    timeString += this.getMinutes() + "-";
    timeString += this.getSeconds();
    return timeString;
  };
};

exports.createSalt = function() {
  var i, letterSet, result;
  result = "";
  letterSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 0; i <= 19; i++) {
    result = result += letterSet[Math.floor(Math.random() * letterSet.length)];
  }
  return result;
};

exports.hashMD5 = function(str) {
  var md5;
  md5 = require('md5');
  return md5(str);
};
