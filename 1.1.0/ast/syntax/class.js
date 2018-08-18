const { log, err, warn, info, json, success } = require('../../helpers/logger');

module.exports = (peek, consume, peekBack, recall, nextLine, parse) => {
  console.log(peek());
  if (peek().type == "CLASS") {
    // Class creation
    consume();
    if (peek().type != "ID")
      err(`Expected 'ID' but got '${consume().type}'`);
    let className = consume().value;
    console.log(peek());
    if (peek().type != "BRACE_OPEN")
      err(`Expected '{' but got '${consume().type}'`);
    consume();
    let code = [];
    do {
      let parsed = parse(peek());
      if (parsed)
        code.push(parsed);
    } while (peek().type != "BRACE_CLOSE");
    consume();
    return {
      type: 'CLASS',
      name: className,
      code: code
    };
  } else {
    // New class instance
    consume();
    if (peek().type != "ID")
      err(`Expected 'ID' but got '${consume().type}'`);
    let initializer = parse(peek());
    console.log(peek());
    return {
      type: 'CLASS_INSTANCE',
      name: initializer.function,
      args: initializer.args
    };
  }
}
