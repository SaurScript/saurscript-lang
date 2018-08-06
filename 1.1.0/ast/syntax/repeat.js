const { log, err, warn, info, json, success } = require('../../helpers/logger');
const codeBlock = require('./code-block');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();

  // If statements can optionally be enclosed with ()s
  let parens = true
  if (peek().type != "PAREN_OPEN")
    parens = false;

  let repeat = {
    "type": "REPEAT"
  }

  let times = [];
  do {
    times.push(consume());
  } while ((peek()||{type:null}).type != (parens ? "PAREN_CLOSE" : "BRACE_OPEN"));

  repeat.times = (new AST(times)).tree;

  if (peek().type != "BRACE_OPEN")
    err(`Expected '{' but got '${peek().type}'`);
  consume();

  let code = codeBlock(peek, consume, peekBack, recall, nextLine, parse);
  repeat.code = code;
  do {
    consume();
  } while ((peek()||{type:null}).type == "NEWLINE");
  consume();

  // We can iterate an array by using `with`. This is the equivalent to doing `for (let item in array)`
  if ((peek()||{type:null}).type == "REPEAT_WITH") {
    consume();
    if (peek().type != "ID")
      err(`Expected 'ID' but got '${peek().type}'`);
    let withName = consume();
    repeat.with = withName.value;
  }

  return repeat;
}
