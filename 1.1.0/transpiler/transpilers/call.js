const Transpiler = require('../transpiler');

module.exports = statement => {
  let args = [];
  statement.args.forEach(arg => args.push((new Transpiler([arg])).compile()));
  return `${statement.function}(${args.join(', ')})`;
}
