const { log, err, warn, info, json, success } = require('../../helpers/logger');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();
  let re = {
    "type": "RETURN"
  };

  let res = [];
  if ((peek() || {type:"NEWLINE"}).type != "NEWLINE") {
    do {
      res.push(consume());
    } while ((peek() || {type:"NEWLINE"}).type != "NEWLINE");
  }
  consume();
  let code = new AST(res);
  re.return = code.tree;

  return re;
}
