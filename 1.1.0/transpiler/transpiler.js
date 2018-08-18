const AST = require('../ast/ast');

const { setPrefix, log, err, warn, info, json, success } = require('../helpers/logger');

class Transpiler {
  constructor(ast) {
    this.ast = ast;
    setPrefix("Transpiler", 2);

    info('Reading statement parsers...');
    this.transpilers = require('./transpilers');
    success(this.transpilers.transpilers.filter(parser => parser.transpiler).length + ' statement parsers found.');
  }

  compile() {
    info(`Transpiling ${this.ast.length} statements to JS`);

    let code = "";

    this.ast.forEach(statement => {
      let parserFile = this.transpilers.transpilers.filter(parser => parser.type == statement.type.toUpperCase())[0];
      if (parserFile) {
        if (parserFile.transpiler) {
          const parser = require(parserFile.transpiler);
          code += parser(statement);
          code += '\n';
        } else {
          err(`No transpiler found for statement of type '${statement.type}'`);
        }
      } else {
        err(`No transpiler found for statement of type '${statement.type}'`);
      }
    });

    return code;
  }
}

module.exports = Transpiler;
