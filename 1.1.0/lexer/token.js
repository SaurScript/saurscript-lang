class Token {
  constructor(type, value, regex) {
    this.type = type;
    this.value = value;
    this.regex = regex;
  }
}

module.exports = Token;
