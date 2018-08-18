const prettyjson = require('prettyjson');
const colors = require('colors');
/*
function timestamp() {
  let date = new Date();
  return '['.gray + ((date.getHours() % 12) + ':' + date.getMinutes() + ':' + date.getSeconds()).magenta + ']'.gray;
}*/
prefix = "[" + "saur".gray + "]";

module.exports = {
  setPrefix: function(str, intensity) {
    let colored = intensity == 0 ? str.yellow : intensity == 1 ? str.green : str.green.bold;
    prefix = "[" + str.gray + "]";
  },
  log: function(msg) {
    console.log(prefix, msg);
  },
  err: function(msg) {
    console.log(prefix, msg.red.bold);
    process.exit();
  },
  warn: function(msg) {
    console.log(prefix, msg.yellow);
  },
  success: function(msg) {
    console.log(prefix, msg.green.bold);
  },
  info: function(msg) {
    console.log(prefix, msg);
  },
  json: function(obj) {
    console.log(prefix, prettyjson.render(obj));
  }
}
