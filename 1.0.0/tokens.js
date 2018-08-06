const DELIMITERS = require("./helpers/delimiters");
const KEYWORDS = require("./helpers/keywords");

function Tokens(code) {
  this.tokens = [];

  this.lines = code.split(new RegExp(`(${DELIMITERS.line.join('|')})`));
  this.lines.forEach(line => {
    let lineTokens = [];
    line.split(new RegExp(`(${DELIMITERS.segment.join('|')})`)).forEach(segment => {
      if (!DELIMITERS.ignore.includes(segment)) lineTokens.push(this.classify(segment, this.lines.indexOf(line), line.indexOf(segment)));
    });
    this.tokens.push(lineTokens);
  });
  return this.tokens;
}

Tokens.prototype = {
  classify: (segment, i, j) => {
    let type = "identifier";
    for (let key in KEYWORDS) {
      if (!KEYWORDS.hasOwnProperty(key)) continue;
      let regex = new RegExp(`(${KEYWORDS[key].join('|')})`);
      if (regex.test(segment.trim())) {
        type = key;
        break;
      }
    }
    return {
      token: segment,
      type: type,
      line: i + 1,
      char: j + 1
    }
  },
}

module.exports = Tokens;
