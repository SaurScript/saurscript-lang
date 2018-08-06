const Transpiler = require('../transpiler');

module.exports = statement => {
  if (statement.type == "NEW_VARIABLE") {
    let value = new Transpiler([statement.value]);
    let code = `const ${statement.name} = ${value.compile()};`;
    return code;
  } else if (statement.type == "VARIABLE") {
    return statement.value;
  } else if (statement.type == "SUBSCRIPT") {
    return `${statement.variable}[${(new Transpiler(statement.subscript)).compile()}]`;
  }
}
