const { log, err, warn, info, json, success } = require('../../helpers/logger');

const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  // Parse the token and return some JSON
  let varName = consume();

  // We're not declaring a variable:
  if ((peek() || {type:null}).type != "COLON") {
    if ((peek() || {type:null}).type == "PAREN_OPEN") {
      // Calling a function
      consume();
      let args = [];
      if ((peek() || {type:null}).type != "PAREN_CLOSE") {
        do {
          args.push(consume());
        } while ((peek() || {type:null}).type != "PAREN_CLOSE")
      }
      return {
        "type": "CALL",
        "function": varName.value,
        "args": (new AST(args)).tree
      };
    } else if ((peek()||{type:null}).type == "BRACKET_OPEN") {
      // Subscript
      consume();
      let subscript = [];
      do {
        subscript.push(consume());
      } while ((peek()||{type:null}).type != "BRACKET_CLOSE");
      return {
        "type": "SUBSCRIPT",
        "variable": varName.value,
        "subscript": (new AST(subscript)).tree
      }
    } else {
      return {
        "type": "VARIABLE",
        "value": varName.value
      }
    }
  }

  consume();

  if (peek().type != "TYPE")
    err(`Variable declarations require a type. Expected 'Type', but got '${peek().type}'`);
  let type = consume();

  let val = [];
  do {
    val.push(consume());
  } while ((peek() || {type:"NEWLINE"}).type != "NEWLINE");

  let value = new AST(val);

  if (value.tree[0].type != type.value.toUpperCase() && value.tree[0].type != "OPERATION" && value.tree[0].type != "VARIABLE")
    warn("Variable type and value type don't match");

  nextLine();

  return {
    "type": "NEW_VARIABLE",
    "name": varName.value,
    "dataType": type.value,
    "value": value.tree[0]
  };
}
