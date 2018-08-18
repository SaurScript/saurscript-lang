const Transpiler = require('../transpiler');

module.exports = statement => {
  let args = [];
  statement.args.forEach(arg => args.push((new Transpiler([arg])).compile()));
  let argList = args.map(arg => `(${arg})`);
  return `${statement.function}${argList.join('')};`;
}
