const Transpiler = require('../transpiler');

module.exports = statement => {
  let left = (new Transpiler([statement.left])).compile();
  let right = (new Transpiler([statement.right])).compile();
  return `${left} ${statement.operator} ${right}`;
}
