const Token = require('./token');

const fs = require('fs');
const path = require('path');
const { setPrefix, log, err, warn, info, json, success } = require('../helpers/logger');
setPrefix("Lexer", 0);

info('Reading rules...');
const ruleJSON = require('./rules');
success(ruleJSON.rules.length + ' rules found.');

class Lexer {
  constructor(code, rules = ruleJSON) {
    this.rules = rules;
    this.code = code;
  }

  lex() {
    let tokens = [];
    let foundToken = false;

    let match;
    let i;
    let numTokenTypes = this.rules.rules.length;

    do {
      for (i = 0; i < numTokenTypes; i++) {
        let regex = new RegExp(this.rules.rules[i].match);
        match = regex.exec(this.code);
        if (match) {
          tokens.push(new Token(this.rules.rules[i].type, match[0], this.rules.rules[i].match));
          this.code = this.code.substring(match[0].length);
          foundToken = true;
          break;
        }
      }
    } while (this.code.length > 0 && foundToken);

    return tokens;
  }
}

module.exports = Lexer;
