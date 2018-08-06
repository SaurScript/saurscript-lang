const { log, err, warn, info, json, success } = require('../../helpers/logger');
const codeBlock = require('./code-block');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();

  // If statements can optionally be enclosed with ()s
  let parens = true
  if (peek().type != "PAREN_OPEN")
    parens = false;

  let conditional = {
    "type": "IF"
  }

  let condition = [];
  do {
    condition.push(consume());
  } while ((peek()||{type:null}).type != (parens ? "PAREN_CLOSE" : "BRACE_OPEN"));

  conditional.if = (new AST(condition)).tree;

  if (peek().type != "BRACE_OPEN")
    err(`Expected '{' but got '${peek().type}'`);
  consume();

  let code = codeBlock(peek, consume, peekBack, recall, nextLine, parse);
  conditional.ifBlock = code;
  consume();

  if (peek().value == "elif") {
    console.log("ELIFS");
    conditional.elifs = [];
    do {
      consume();
      let condition = [];
      do {
        condition.push(consume());
      } while ((peek()||{type:null}).type != (parens ? "PAREN_CLOSE" : "BRACE_OPEN"));

      let elifCondition = (new AST(condition)).tree;

      if (peek().type != "BRACE_OPEN")
        err(`Expected '{' but got '${peek().type}'`);
      consume();

      let code = codeBlock(peek, consume, peekBack, recall, nextLine, parse);
      conditional.elifs.push({
        "condition": elifCondition,
        "code": code
      });
      consume();
    } while (peek().value == "elif");
  }
  if (peek().value == "else") {
    consume();
    if (peek().type != "BRACE_OPEN")
      err(`Expected '{' but got '${peek().type}'`);
    consume();

    let code = codeBlock(peek, consume, peekBack, recall, nextLine, parse);
    conditional.else = code;
  }

  return conditional;
}
