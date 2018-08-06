const { log, err, warn, info, json, success } = require('../../../helpers/logger');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();
  return {
    "type": "NULL",
    "value": null
  }
}
