 module.exports=Person;

 function  Person(name1,age1){
     this.n =name1;
     this.a =age1;
     this.sayname= function  () {
         console.log(this.n )
     }
 }
 Person.walk=function(){
     console.log(this.n +"==>walk" )
 }

 Person.prototype.eat=function(){
     console.log(this.n +"==>eat" )

 }

