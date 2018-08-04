let types = ["String", "Int", "Float", "Bool", "Any"];

let arrayTypes = [];
types.forEach(type => {
  arrayTypes.push(`Array\\<${type}\\>`);
});

// Add dictionary types for every combination
let dictionaryTypes = [];
types.forEach(key => {
  types.concat(arrayTypes).forEach(value => {
    dictionaryTypes.push(`Dictionary\\<${key}\\:${value}\\>`);
  });
});

types = types.concat(arrayTypes).concat(dictionaryTypes);

module.exports = types;
