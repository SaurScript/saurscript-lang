const { log, err, warn, info, json, success } = require('../../../helpers/logger');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  return {
    "type": "STRING",
    "value": consume().value
  };
}
