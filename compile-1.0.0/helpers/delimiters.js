const KEYWORDS = require('./keywords');

module.exports = {
  line: ["\\n", ";"],
  segment: [" ", "\\(", "\\)", "\\[", "\\]", "\\{", "\\}", '\\"', "\\'", ",", "`"].concat(KEYWORDS.operator),
  ignore: ["\n", "", null]
}
