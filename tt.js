var arryAll = [];
arryAll.push({'age1':1});
arryAll.push({"age2":2});
arryAll.push({age:3});
arryAll.push({age:4});

arryAll.forEach(function(e){
    e.age=4;

})
console.log(arryAll)//[ { age: 4 }, { age: 4 }, { age: 4 }, { age: 4 } ]


