const Transpiler = require('../transpiler');

module.exports = statement => {
  let val = (new Transpiler(statement.return)).compile();
  return `return ${val};`;
}
