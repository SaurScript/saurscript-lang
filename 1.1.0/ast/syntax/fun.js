const { log, err, warn, info, json, success } = require('../../helpers/logger');
const codeBlock = require('./code-block');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();
  if (peek().type != "ID")
    err(`Expected 'ID' but got '${peek().type}'`);
  let fun = {
    "type": "FUNCTION",
    "name": consume().value
  }

  if (peek().type != "PAREN_OPEN")
    err(`Expected '(' but got '${peek().type}'`);
  consume();

  fun.args = [];
  if (peek().type != "PAREN_CLOSE") {
    do {
      if (peek().type != "ID")
        err(`Expected 'ID' but got '${peek().type}'`);
      let arg = {
        "name": consume().value
      };
      consume();
      if (peek().type != "TYPE")
        err(`Expected type but got '${peek().type}'`);
      arg.type = consume().value;
      fun.args.push(arg);
    } while (peek().type != "PAREN_CLOSE");
  }
  consume();

  if (peek().type != "COMPARATOR") {
    // NO RETURN VALUE
    fun.returnType = null;
  } else {
    consume();
    if (peek().type != "TYPE")
      err(`Expected type but got '${peek().type}'`);
    fun.returnType = consume().value;
  }

  if (peek().type != "BRACE_OPEN")
    err(`Expected '{' but got '${peek().type}'`);
  consume();

  let code = codeBlock(peek, consume, peekBack, recall, nextLine, parse);
  fun.code = code;

  return fun;
}
