const Transpiler = require('../transpiler');

module.exports = statement => {
  let condition = (new Transpiler(statement.if)).compile();
  let ifBlock = (new Transpiler(statement.ifBlock)).compile();
  let elifs = "";
  let elseBlock = "";

  if (statement.else) {
    elseBlock = ` else { ${(new Transpiler(statement.else)).compile()} }`;
  }

  if (statement.elifs) {
    statement.elifs.forEach(elif => {
      let elifCondition = (new Transpiler(elif.condition)).compile();
      let elifBlock = (new Transpiler(elif.code)).compile();
      elifs += `else if (${elifCondition}) { ${elifBlock} }`;
    });
  }

  return `if (${condition}) { ${ifBlock} }${elifs}${elseBlock};`;
}
