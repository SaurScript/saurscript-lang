const Lexer = require('../lexer/lexer');

const fs = require('fs');
const path = require('path');
const { setPrefix, log, err, warn, info, json, success } = require('../helpers/logger');
setPrefix("AST", 1);

info('Reading token parsers...');
const syntaxJSON = require('./syntax');
success(syntaxJSON.syntax.filter(parser => parser.parser).length + ' token parsers found.');

class AST {
  constructor(tokens) {
    // Build the AST.
    this.build(tokens);
  }

  build(tokens) {
    info("Building AST from " + tokens.length + " tokens");

    this.tokens = tokens;
    this.trim();

    this.tree = [];
    this.i = 0;
    do {
      let token = this.peek();
      let parsed = this.parse(token, true);
    } while (this.i <= (this.tokens.length - 1));
  }

  parse(token, addToTree) {
    let parserFile = syntaxJSON.syntax.filter(parser => parser.type == token.type)[0];
    if (parserFile) {
      if (parserFile.parser) {
        const parser = require(parserFile.parser);
        let parsed = parser(this.peek.bind(this), this.consume.bind(this), this.peekBack.bind(this), this.recall.bind(this), this.nextLine.bind(this), this.parse.bind(this));
        if (addToTree && parsed)
          this.tree.push(parsed);
        return parsed;
      } else {
        this.consume();
      }
    } else {
      this.consume();
    }
  }

  trim() {
    this.tokens = this.tokens.filter(token => token.type != "WHITESPACE");
  }

  peek() {
    return this.tokens[this.i];
  }

  consume() {
    return this.tokens[this.i++];
  }

  peekBack() {
    //return this.tokens[this.i - 1];
    return this.tree[this.tree.length - 1];
  }

  recall() {
    return this.tree.pop();
    //return this.tokens[this.i--];
  }

  nextLine() {
    if ((this.peek() || {type:"NEWLINE"}).type != "NEWLINE") {
      do {
        console.log(this.consume().type);
      } while ((this.peek() || {type:"NEWLINE"}).type != "NEWLINE");
    }
    this.consume();
  }
}

module.exports = AST;
