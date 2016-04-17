var Person = require("./Person");
var john = new Person("fangchao", 24);
john.sayname();//fangchao
Person.walk();//undefined==>walk
john.eat();//fangchao==>eat
//john.walk()//john.walk is not a function
//Person.eat();//Person.eat is not a function
