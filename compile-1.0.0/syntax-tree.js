const Tokens = require('./tokens');
const Logger = require('./helpers/logger');
const logger = new Logger();

function SyntaxTree(tokens) {
  this.tree = [];
  this.lines = tokens.filter(l => l.length != 0);
  this.lineIndex = 0;
  this.index = 0;
  while (tokens.length > this.lineIndex) {
    let parsed = this.parse();
    if (parsed != null) this.tree.push(parsed);
    this.lineIndex++;
    this.index = 0;
  }
  return this.tree;
}

SyntaxTree.prototype = {
  peek: function() {
    return this.lines[this.lineIndex][this.index];
  },
  consume: function() {
    return this.lines[this.lineIndex][this.index++];
  },
  trim: function() {
    while (this.peek().token == " " || this.peek().token == ",") {
      this.consume();
    }
  },
  emptyLine: function() {
    return this.lines[this.lineIndex].length <= 0;
  },
  done: function() {
    return this.lines.length <= this.lineIndex;
  },
  endOfLine: function() {
    return this.lines[this.lineIndex] == null;
  },
  parse: function() {
    if (this.done()) {
      return;
    } else if (this.emptyLine()) {
      return;
    } else if (this.peek() == null) {
      return;
    }
    this.trim();
    let type = this.peek().type;

    switch(type) {
      case "import": {
        let imported = {
          type: "import"
        };
        this.consume();
        this.trim();
        imported.path = this.lines[this.lineIndex].map(line => line.token).slice(this.index + 1, this.lines[this.lineIndex].length - 1).join(" ");
        return imported;
      }
      case "export": {
        let exported = {
          type: "exported"
        };
        this.consume();
        this.trim();
        if (this.peek().type == null) {
          this.throw("Cannot export 'null'");
        }
        exported.value = this.parse();
        return exported;
      }
      case "class": {
        let classObj = {
          type: "class",
          properties: [],
          block: []
        };

        this.consume();
        this.trim();

        if (this.peek().type != "identifier")
          this.unexpected("identifier", this.peek().type);
        classObj.name = this.consume().token;

        this.lineIndex++;
        this.index = 0;
        let tree = [];
        while (this.peek().type != "endClass") {
          this.trim();
          let parsed = this.parse();
          if (parsed != null) tree.push(parsed);
          this.lineIndex++;
          this.index = 0;
        }

        tree.forEach(item => {
          if (item.type == "property") {
            classObj.properties.push(item.value);
          } else {
            classObj.block.push(item);
          }
        });

        return classObj;
      }
      case "property": {
        let property = {
          type: "property",
        }
        this.consume();
        this.trim();
        if (this.peek().type != "type")
          this.unexpected("type", this.peek().type);
        let rest = this.lines[this.lineIndex].slice(this.index, this.lines[this.lineIndex].length);
        property.value = new SyntaxTree([rest]);
        return property;
      }
      case "instance": {
        let instance = {
          type: "classInstance"
        }
        this.consume();
        this.trim();
        if (this.peek().type == "type") {
          if (this.peek().token.split("<")[0] != null) {
            if (!(this.peek().token.split("<")[0].includes("Array") || this.peek().token.split("<")[0].includes("Dictionary"))) {
              this.throw(`Cannot create an instance of a type other than Array<T> or Dictionary<T>. Use a ${this.peek().token} literal.`);
            }
          } else {
            this.throw(`Cannot create an instance of a type other than Array<T> or Dictionary<T>. Use a ${this.peek().token} literal.`);
          }
          instance.type = "collection";
        } else if (this.peek().type != "identifier") {
          this.unexpected("identifier", this.peek().type);
        }
        instance.className = this.consume().token;
        this.trim();
        if (instance.type == "classInstance") {
          if (this.peek().type != "identifier") {
            this.unexpected("identifier", this.peek().type);
          }
          instance.name = this.consume().token;
        }
        if (this.peek().type != "openParen") {
          this.unexpected("(", this.peek().type);
        }
        this.consume();
        let argTokens = [];
        let line = [];
        while (this.peek().type != "closeParen") {
          if (this.peek().token == ",") {
            this.consume();
            argTokens.push(line);
            line = [];
          }
          let token = this.consume();
          if (token != null) line.push(token);
        }
        argTokens.push(line);
        instance.properties = new SyntaxTree(argTokens);
        return instance;
      }
      case "comment": {
        return;
      }
      case "startJS": {
        let code = "";
        this.consume();
        while ((this.peek() || {token: '`'}).token != "`") {
          code += this.consume().token;
        }
        return {
          type: "js",
          value: code
        }
      }
      case "function": {
        let fun = {
          type: "function"
        };
        this.consume();
        this.trim();
        if (this.peek().type != "identifier") {
          this.unexpected("a function name", this.peek().token);
        }
        fun.name = this.consume().token;
        this.trim();
        if (this.peek().type != "openParen") {
          this.unexpected("'('", this.peek().token);
        }
        this.consume();
        this.trim();
        fun.args = [];
        while (this.peek().type != "closeParen") {
          let arg = {};
          if (this.peek().type != "type") {
            this.unexpected("a type", this.peek().token);
          }
          arg.type = this.consume().token;
          this.trim();
          if (this.peek().type != "identifier") {
            this.unexpected("a param name", this.peek().token);
          }
          arg.name = this.consume().token;
          this.trim();
          if (this.peek().type == "setter") {
            // We have a default value
            this.consume();
            this.trim();
            // Defaults are always wrapped in brackets: {}
            this.consume();
            let val = [];
            while (this.peek().type != "closeBracket") {
              val.push(this.consume());
            }
            this.trim();
            this.consume();
            this.trim();
            arg.default = new SyntaxTree([val]);
          }
          fun.args.push(arg);
        }
        this.consume();
        this.trim();
        if (this.peek().type == "comparator" && this.peek().token == ">") {
          this.consume();
          this.trim();
          if (this.peek().type != "type") {
            this.unexpected("a type", this.peek().type);
          }
          fun.returnType = this.consume().token;
          this.trim();
        }
        if (this.peek().type != "openBracket") {
          this.unexpected("'{'", this.peek().type);
        }
        // Get the codeblock:
        let codeBlock = [];
        fun.block = [];
        this.lineIndex++;
        this.index = 0;
        while (this.peek().type != "closeBracket") {
          let parsed = this.parse();
          if (parsed != null) fun.block.push(parsed);
          this.lineIndex++;
          this.index = 0;
          this.trim();
        }
        return fun;
      }
      case "if": {
        let ifBlocks = {
          type: "if"
        }

        let parseIf = () => {
          let condition = { };
          this.consume();
          this.trim();
          // () aren't needed around if statements
          let usesParens = false;
          if (this.peek().token == "(") {
            this.consume();
            usesParens = true;
          }
          this.trim();
          let statement = "";
          while ((this.peek() || {token: "{"}).token != "{") {
            statement += this.consume().token;
            if (this.peek() == null) {
              this.unexpected("{", "undefined");
            }
          }
          this.consume();
          condition.condition = usesParens ? statement.trim().substr(0, statement.trim().length - 1) : statement.trim();
          condition.block = [];
          this.lineIndex++;
          this.index = 0;
          while ((this.peek() || {type: null}).type != "closeBracket") {
            let parsed = this.parse();
            if (parsed != null) condition.block.push(parsed);
            this.lineIndex++;
            this.index = 0;
            this.trim();
          }
          this.consume();
          if (this.peek() != null) {
            this.trim();
          }
          console.log(this.peek());
          return condition;
        }

        let parsedIf = parseIf();
        ifBlocks.if = {
          condition: parsedIf.condition,
          block: parsedIf.block
        }

        if ((this.peek() || {type: null}).type == "elseif") {
          // We have to parse this block too
          let parsedElif = parseIf();
          ifBlocks.elif = {
            condition: parsedElif.condition,
            block: parsedElif.block
          }
        }

        if ((this.peek() || {type: null}).type == "else") {
          let parsedElse = parseIf();
          ifBlocks.else = parsedElse.block;
        }

        return ifBlocks;
      }
      case "repeat": {
        let loop = {
          type: "repeat",
        }
        this.consume();
        this.trim();
        // Doesn't have to use () around how many times
        let usesParens = false;
        if (this.peek().token == "(") {
          this.consume();
          usesParens = true;
        }
        this.trim();
        let times = "";
        while ((this.peek() || {token: "{"}).token != "{") {
          times += this.consume().token;
          if (this.peek() == null) {
            this.unexpected("{", "undefined");
          }
        }
        this.consume();
        loop.times = usesParens ? times.trim().substr(0, times.trim().length - 1) : times.trim();
        loop.block = [];
        this.lineIndex++;
        this.index = 0;
        while ((this.peek() || {type: null}).type != "closeBracket") {
          let parsed = this.parse();
          if (parsed != null) loop.block.push(parsed);
          this.lineIndex++;
          this.index = 0;
          this.trim();
        }
        this.consume();
        if (this.peek() != null) {
          this.trim();
        }
        return loop;
      }
      case "type": {
        // We're making a variable!
        let variable = {
          type: "variable",
          valueType: this.consume().token
        };
        this.trim();
        if (this.peek().type == "identifier") {
          variable.name = this.consume().token;
        } else {
          this.unexpected("identifier", this.consume().type);
        }
        this.trim();
        if (this.peek().type == "setter") {
          this.consume();
        } else {
          this.unexpected("=", this.peek().type);
        }
        this.trim();
        let val = [];
        while (this.peek() != null) {
          val.push(this.consume());
        }
        variable.value = new SyntaxTree([val]);
        return variable;
      }
      case "openBrace": {
        this.consume();
        let toks = this.lines[this.lineIndex].slice(this.index, this.lines[this.lineIndex].length);
        if (toks.map(l => l.token).join('').includes(':')) {
          // Dictionary
          let dict = {};
          let key = [];
          let value = [];
          let parsingVal = false;
          let i = 0;
          for (let token in toks) {
            if (toks[token].token == ',') {
              dict[token] = {
                key: new SyntaxTree([key]),
                value: new SyntaxTree([value])
              };
              key = [];
              value = [];
              parsingVal = false;
              i++;
              continue;
            }
            if (toks[token].token == ":") {
              value = [];
              parsingVal = true;
              continue;
            } else if (!parsingVal) {
              key.push(toks[token]);
            } else {
              value.push(toks[token]);
            }
          }
          dict[i] = {
            key: new SyntaxTree([key]),
            value: new SyntaxTree([value])
          };
          return {
            type: "dictionary",
            value: dict
          };
        } else {
          // Array
          let tokens = [[]];
          let i = 0;
          while ((this.peek() || {type:'closeBrace'}).type != "closeBrace") {
            if (this.peek().token == ",") {
              i++;
              tokens[i] = [];
            }
            tokens[i].push(this.consume());
          }
          let arr = new SyntaxTree(tokens);
          return {
            type: "array",
            value: arr
          };
        }
        return "";
      }
      case "openCloseString": {
        this.consume();
        let string = "";
        while (this.peek().type != "openCloseString") {
          string += this.consume().token;
        }
        return {
          type: "String",
          value: string
        };
      }
      case "number": {
        let operation = [];
        // Make sure we get all operations
        let expectedType;
        while (this.peek() != null) {
          this.trim();
          if (this.peek().type == "operator") {
            operation.push({
              type: "operator",
              value: this.consume().token
            });
          } else {
            if (parseFloat(this.peek().token) % 1 === 0) {
              if (expectedType == null) expectedType = "Int";
              if (expectedType != "Int") this.unexpected("Float", "Int");
              operation.push({
                type: "Int",
                value: parseInt(this.consume().token)
              });
            } else {
              if (expectedType == null) expectedType = "Float";
              if (expectedType != "Float") this.unexpected("Int", "Float");
              operation.push({
                type: "Float",
                value: parseFloat(this.consume().token)
              })
            }
          }
        }
        return operation;
      }
      case "identifier": {
        let id = this.consume().token;
        if (this.peek() != null) {
          this.trim();
        }
        if ((this.peek() || {type: null}).type == "openParen") {
          // Function call
          this.consume();
          let call = {
            type: "call",
            function: id,
            args: []
          };
          // Get the arguments to pass through
          let argTokens = [];
          let line = [];
          while (this.peek().type != "closeParen") {
            if (this.peek().token == ",") {
              this.consume();
              argTokens.push(line);
              line = [];
            }
            let token = this.consume();
            if (token != null) line.push(token);
          }
          argTokens.push(line);
          call.args = new SyntaxTree(argTokens);
          return call;
        } else if ((this.peek() || {token: null}).token == " ") {
          // It's just whitespace, who cares.
          console.log(this.peek());
          return;
        } else {
          // It must be a variable reference
          let operation = [];
          operation.push({
            type: "reference",
            value: id
          });
          while (this.peek() != null) {
            this.trim();
            if (this.peek().type == "operator") {
              operation.push({
                type: "operator",
                value: this.consume().token
              });
            } else {
              operation.push(this.consume());
            }
          }
          return operation;
        }
      }
      case "return": {
        this.consume();
        let returnTokens = [];
        while (this.peek() != null) {
          returnTokens.push(this.consume());
        }
        return {
          type: "return",
          value: new SyntaxTree([returnTokens])
        }
      }
      default: {
        return this.consume();
      }
    }
  },

  throw: function(message) {
    logger.error(`Syntax Error: ${message} (${this.peek().line}:${this.peek().char})`);
    process.exit();
  },
  unexpected: function(expected, got) {
    this.throw(`Expected ${expected} but got '${got}'`);
  }
}

module.exports = SyntaxTree;
