const { log, err, warn, info, json, success } = require('../../helpers/logger');
const { resolve } = require('path');
const fs = require('fs');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  consume();
  let path = peek().value.substr(1, peek().value.length - 2);
  if (!path.includes('.saur')) {
    // It's a built-in library:
    path = resolve(__dirname, '../../lib/', path + '.saur');
    if (!fs.existsSync(path)) {
      err(`The library '${peek().value}' cannot be found. Did you mean to reference a local '.saur' file?`);
    }
  }
  consume();
  return {
    type: "IMPORT",
    path: path
  }
}
