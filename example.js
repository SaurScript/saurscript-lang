
/* --- /Users/Ryan/Desktop/LazyScript/1.1.0/lib/common.saur --- */
function println(message) { console.log(message); }

const employees = [["Ryan", 100], ["T-Rex", 50], ["Carson", 40], ["Cameron", 20]];function getSalary(name) { for (let employee = 0; employee < employees.length; employee++) { if (employees[employee][0] == name) { return employees[employee][1]; }else if (employees[employee][0] == "T-Rex") { println("Rawr"); } else { println("Not it"); }; }; }function getSalaryRec(name, i = 0) { println(employees[i]);if (employees[i][0] == name) { return employees[i][1]; } else { return getSalaryRec(name, i + 1);; }; }const salary = getSalaryRec("Cameron");;println("Cameron's Salary: " + salary);