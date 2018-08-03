const colors = require('colors');
const prettyjson = require('prettyjson');

class Logger {
  constructor() {}

  error(message) {
    console.log(message.red.bold);
  }
  warning(message) {
    console.log(message.yellow.bold);
  }
  success(message) {
    console.log(message.green.bold);
  }
  log(message) {
    console.log(message);
  }
  info(message) {
    console.log(message.blue.bold);
  }
  json(obj) {
    console.log(prettyjson.render(obj));
  }
}

module.exports = Logger;
