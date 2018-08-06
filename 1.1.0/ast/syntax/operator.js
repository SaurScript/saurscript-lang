const { log, err, warn, info, json, success } = require('../../helpers/logger');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  let left = recall();
  let operator = consume();
  let right = new AST([consume()]);

  if (left.type != right.tree[right.tree.length - 1].type && left.type != "VARIABLE" && right.tree[right.tree.length - 1].type != "VARIABLE" && left.type != "OPERATION" && right.tree[right.tree.length - 1].type != "OPERATION")
    err(`Types '${left.type}' and '${right.tree[right.tree.length - 1].type}' don't match.`);

  return {
    "type": "OPERATION",
    "left": left,
    "operator": operator.value,
    "right": right.tree[right.tree.length - 1]
  };
}
