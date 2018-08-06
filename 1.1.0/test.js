const Lexer = require('./lexer/lexer');
const AST = require('./ast/ast');
const Transpiler = require('./transpiler/transpiler');

let lex = new Lexer(`
employees: Array = [["Ryan", 100.0], ["T-Rex", 50.0], ["Carson", 40.0], ["Cameron", 20.0]]
fun getSalary(name: String) > Int {
  repeat employees.length {
    if employees[employee][0] == name {
      return employees[employee][1]
    } elif employees[employee][0] == "T-Rex" {
      console.log("Rawr")
    } else {
      console.log("Not it")
    }
  } with employee
}

salary: Int = getSalary("Cameron")
console.log("Cameron's Salary: " + salary)`);
let ast = new AST(lex.lex());
let js = new Transpiler(ast.tree);
console.log(js.compile());
