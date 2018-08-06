const { log, err, warn, info, json, success } = require('../../helpers/logger');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();
  let code = [];
  if ((peek() || {type:"BRACE_CLOSE"}).type != "BRACE_CLOSE") {
    do {
      let parsed = parse(peek());
      if (parsed)
        code.push(parsed);
    } while ((peek() || {type:"BRACE_CLOSE"}).type != "BRACE_CLOSE");
  }
  return code;
}
