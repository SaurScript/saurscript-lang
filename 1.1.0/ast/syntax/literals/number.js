const { log, err, warn, info, json, success } = require('../../../helpers/logger');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  if (peek().value.includes('.')) {
    return {
      "type": "FLOAT",
      "value": parseFloat(consume().value)
    };
  } else {
    return {
      "type": "INT",
      "value": parseInt(consume().value)
    };
  }
}
