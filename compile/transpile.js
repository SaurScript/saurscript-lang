const Tokens = require('./tokens');
const SyntaxTree = require('./syntax-tree');

// IMPORTS:
const fs = require('fs');
const path = require('path');

//console.log(require('./helpers/types'));
const Logger = require('./helpers/logger');
const logger = new Logger();

function Transpile(tree, functions = {}, vars = {}, classes = {}, exported = [], path = '') {
  this.FUNCTIONS = functions;
  this.VARIABLES = vars;
  this.CLASSES = classes;
  this.PATH = path;
  this.EXPORTED = [];

  this.js = "";
  tree.forEach(element => this.js += this.toJS(element));
  return this.js;
}

Transpile.prototype = {
  toJS: function(element) {
    switch(element.type) {
      case "import": {
        let p = element.path.replace(/ /g, '');
        if (!p.includes('.saur'))
          p += '.saur';
        p = path.join(this.PATH, p);
        logger.info("Importing " + p);
        let file = fs.readFileSync(p, 'utf8');
        let code = new Transpile(new SyntaxTree(new Tokens(file)), this.FUNCTIONS, this.VARS, this.CLASSES, this.EXPORTED, path.dirname(p));
        return `${code.js}${code.EXPORTED.map(e => e.js).join(';')}`;
      }
      case "exported": {
        let code = new Transpile([element.value], this.FUNCTIONS, this.VARS, this.CLASSES, this.EXPORTED);
        this.EXPORTED.push(code);
        return '';
      }
      case "function": {
        // SaurScript is lazy, so don't add the function to the code, but save it for use.
        let args = {};
        element.args.forEach(arg => {
          args[arg.name] = arg;
        });
        let fun = new Transpile(element.block, this.FUNCTIONS, Object.assign({}, args, this.VARIABLES), this.CLASSES);
        this.FUNCTIONS[element.name] = {
          args: element.args,
          returnType: element.returnType,
          code: fun.js
        };
        return "";
      }
      case "call": {
        let fun = this.FUNCTIONS[element.function];
        // FIX
        if (fun != null) {
          let args = [];
          element.args.forEach((arg, i) => {
            if (fun.args[i].type != "Any" && arg[0].type != fun.args[i].type) {
              this.error(`Argument #${i} of ${element.function} expects '${fun.args[i].type}' not ${arg[0].type}`);
            } else {
              args.push(`${fun.args[i].name} = ${(new Transpile(arg, this.FUNCTIONS, this.VARIABLES, this.CLASSES)).js}`);
            }
          });
          return `(function(${args.join(',')}) {${fun.code}})()`;
        } else if (element.function.includes('.')) {
          let args = [];
          element.args.forEach(arg => {
            if (arg == null)
              arg = arg[0];
            let code = new Transpile([arg], this.FUNCTIONS, this.VARIABLES, this.CLASSES);
            args.push(code.js);
          });
          return `${element.function}(${args.join(',')})`
        } else {
          this.error(`The function '${element.function}' doesn't exist`);
        }
      }
      case "class": {
        let props = [];
        element.properties.forEach(prop => {
          let val = new Transpile(prop[0].value, this.FUNCTIONS, this.VARIABLES, this.CLASSES);
          props.push(prop[0].name + " = " + (val.js || 'null'));
        });
        let initVals = "";
        element.properties.forEach(prop => {
          initVals += `this.${prop[0].name} = ${prop[0].name};`;
        });
        let code = new Transpile(element.block, {}, this.VARIABLES, this.CLASSES);
        this.CLASSES[element.name] = element;
        let funs = [];
        for (let i in code.FUNCTIONS) {
          let fun = code.FUNCTIONS[i];
          funs.push(`${i}: function (${fun.args.map(arg => arg.name).join(',')}) { ${fun.code} }`)
        }
        return `const ${element.name} = function (${props.join(',')}) { ${initVals} ${code.js} }; ${element.name}.prototype = { ${funs.join(',')} };`;
      }
      case "classInstance": {
        if (this.CLASSES[element.className] == null) {
          this.error(`A class with the name '${element.className}' doesn't exist`);
        }
        let props = [];
        element.properties.forEach((prop, i) => {
          if (prop.type == null) {
            prop = prop[0];
          }
          if (prop.type != this.CLASSES[element.className].properties[i][0].valueType && prop.type != "reference")
            this.error(`Argument #${i} of ${element.className} expects '${this.CLASSES[element.className].properties[i][0].valueType}' not ${prop.type}`);
          let val = new Transpile([prop], this.FUNCTIONS, this.VARIABLES, this.CLASSES);
          props.push(val.js);
        });
        this.VARIABLES[element.name] = element;
        this.warn("Classes are experimental. You may experience runtime errors.");
        return `const ${element.name} = new ${element.className}(${props.join(',')});`;
      }
      case "array": {
        let vals = [];
        element.value.forEach(val => {
          let js = new Transpile([val], this.FUNCTIONS, this.VARIABLES, this.CLASSES);
          vals.push(js.js);
        });
        this.warn("Array literals are experimental. You may experience runtime errors.");
        return `[${vals.join(',')}]`;
      }
      case "dictionary": {
        let dict = [];
        for (let pair in element.value) {
          let key = new Transpile(element.value[pair].key, this.FUNCTIONS, this.VARIABLES, this.CLASSES);
          let value = new Transpile(element.value[pair].value, this.FUNCTIONS, this.VARIABLES, this.CLASSES);
          dict.push(`${key.js}: ${value.js}`);
        };
        this.warn("Dictionary literals are experimental. You may experience runtime errors.");
        return `{${dict.join(',')}}`;
      }
      case "Int":
      case "Float":
      case "Bool": {
        return element.value;
      }
      case "String": {
        return `"${element.value}"`;
      }
      case "constant": {
        return element.token;
      }
      case "identifier": {
        if (this.VARIABLES[element.token] != null) {
          return element.token;
        } else {
          this.error(`The variable ${element.token} doesn't exist`);
        }
      }
      case "reference": {
        if (this.VARIABLES[element.value] != null) {
          return element.value;
        } else {
          this.error(`The variable ${element.value} doesn't exist`);
        }
      }
      case "operator": {
        // Make sure there's whitespace around the operators
        return ` ${element.value} `;
      }
      case "variable": {
        let val = new Transpile(element.value, this.FUNCTIONS, this.VARIABLES, this.CLASSES);
        this.VARIABLES[element.name] = element;
        return `const ${element.name} = ${val.js};`
      }
      case "return": {
        let code = element.value[0];
        if (element.value[0] == null)
          code = element.value;
        let val = new Transpile([code], this.FUNCTIONS, this.VARIABLES, this.CLASSES);
        return `return ${val.js};`;
      }
      case "js": {
        return element.value;
      }
      default: {
        console.log(element);
        this.warn(`Unhandled type '${element.type}'`);
        return "";
      }
    }
  },

  error: function(err) {
    logger.error("Compiler Error: " + err);
    process.exit();
  },
  warn: function(msg) {
    logger.warning("Compiler Warning: " + msg);
  }
}

console.log(new Transpile(new SyntaxTree(new Tokens(`
@import "include/browser"

@class Entry
  @property String word = null
  @property Array<String> synonyms = []
  fun getSynonyms(String param1) {
    return 5
  }
@endclass
Array<String> dinoSynonyms = ["Dino", "T-Rex"]
@new Entry entry("Dinosaur", dinoSynonyms)
logger.warn("Testing you...");
`))).js);
