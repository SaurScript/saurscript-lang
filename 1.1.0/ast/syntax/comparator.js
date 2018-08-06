const { log, err, warn, info, json, success } = require('../../helpers/logger');
const AST = require('../ast');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  let left = recall();
  let comparator = consume();
  let right = new AST([consume()]);
  return {
    "type": "COMPARISON",
    "left": left,
    "operator": comparator.value,
    "right": right.tree[right.tree.length - 1]
  };
}
