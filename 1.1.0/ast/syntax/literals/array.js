const { log, err, warn, info, json, success } = require('../../../helpers/logger');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();
  let vals = [];
  if ((peek()||{type:null}).type != "BRACKET_CLOSE") {
    do {
      let parsed = parse(peek());
      if (parsed)
        vals.push(parsed);
    } while ((peek()||{type:null}).type != "BRACKET_CLOSE");
  }
  consume();
  return {
    "type": "ARRAY",
    "values": vals
  }
}
