const Transpiler = require('../transpiler');

module.exports = statement => {
  let args = [];
  statement.args.forEach(arg => args.push(arg.name));
  let code = (new Transpiler(statement.code)).compile();
  return `function ${statement.name}(${args.join(', ')}) { ${code} }`;
}
