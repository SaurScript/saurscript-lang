const Lexer = require('../../lexer/lexer');
const AST = require('../../ast/ast');
const Transpiler = require('../transpiler');

const fs = require('fs');

module.exports = statement => {
  let file = statement.path;
  let code = fs.readFileSync(file, 'utf8');

  let lex = new Lexer(code);
  let tree = new AST(lex.lex());

  return `
/* --- ${file} --- */
${(new Transpiler(tree.tree)).compile()}

`;
}
