const Transpiler = require('../transpiler');

module.exports = statement => {
  console.log(statement);
  let times = (new Transpiler(statement.times)).compile();
  let code = (new Transpiler(statement.code)).compile();
  // .some is like .forEach, but you can break out of it
  let useSome = false;
  let someName = "";
  if (statement.with) {
    useSome = true;
    someName = statement.with;
  }
  if (useSome) {
    return `for (let ${someName} = 0; ${someName} < ${times}; ${someName}++) { ${code} };`;
  } else {
    return `for (let i = 0; i < ${times}; i++) { ${code} };`
  }
}
