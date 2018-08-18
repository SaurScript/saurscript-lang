const Transpiler = require('../transpiler');

module.exports = statement => {
  let args = [];
  statement.args.forEach(arg => {
    if (arg.default)
      args.push(`${arg.name} = ${(new Transpiler([arg.default])).compile()}`);
    else
      args.push(arg.name);
  });
  let code = (new Transpiler(statement.code)).compile();
  // We use fat arrow syntax for currying later:
  return `const ${statement.name} = (${args.join(') => (')}) => { ${code} }`;
}
