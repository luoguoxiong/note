function Persion(name) {
  this.name = name;
  //   return { age: 19 };
  //   return this; // 默认返回this??
}

Persion.prototype.say = function () {
  console.log(this.name);
};

// 如果构造函数返回了对象，该对象则变成实例了，所以不要在构造函数中返回对象
const p = new Persion('hewei');

function create(Con, ...args) {
  const obj = Object.create(Con.prototype);
  const result = Con.apply(obj, args);
  return !Object.prototype.toString.call(result) === '[object Object]' ? result : obj;
}

const p2 = create(Persion, 'hewei1');
p2.say();

// 复制原型的方法->执行fn函数->判断fn执行返回结果？return:obj
const create = (fn, ...args) => {
  const obj = Object.create(fn.prototype);
  const result = fn.call(obj, args);
  return result ? result : obj;
};
