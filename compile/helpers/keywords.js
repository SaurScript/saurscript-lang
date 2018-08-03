const TYPES = require('./types');

module.exports = {
  "comment": ["\/\/"],

  "import": ["\\@import"],
  "export": ["\\@export"],
  "class": ["\\@class"],
  "endClass": ["\\@endclass"],
  "property": ["\\@property"],
  "instance": ["\\@new"],
  "enum": ["\\@enum"],
  "type": ["\\@type"],

  "function": ["\\bfun\\b"],
  "return": ["\\breturn\\b"],

  "if": ["\\bif\\b"],
  "elseif": ["\\belif\\b"],
  "else": ["\\belse\\b"],

  "repeat": ["\\brepeat\\b"],

  "type": TYPES.map(type => "\\b" + type + "\\b"),
  "setter": ["="],

  "operator": ["\\+", "\\-", "\\*", "\\/", "\\%", ">>>"],
  "comparator": ["<", ">", "==", "!=", "^is$"],

  "openParen": ["\\("],
  "closeParen": ["\\)"],
  "openBrace": ["\\["],
  "closeBrace": ["\\]"],
  "openBracket": ["\\{"],
  "closeBracket": ["\\}"],

  "delimiter": [","],

  "openCloseString": ['\\"', "\\'"],
  // Allow integers or decimals:
  "number": ["\^\[1\-9]\\d\*\(\\\.\\d\+\)\?\$"],
  "constant": ["\\btrue\\b", "\\bfalse\\b", "\\bnull\\b"],

  "startJS": ["\\`"]

  // Anything else is an ID
}
