const Transpiler = require('../../transpiler');

module.exports = statement => {
  let vals = [];
  statement.values.forEach(val => vals.push((new Transpiler([val])).compile()));
  return `[${vals.join(', ')}]`;
}
