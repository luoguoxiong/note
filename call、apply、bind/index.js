// call是函数的原型链方法，用于修改this指向，会立即执行，参数（Object,arg1,arg2...）
Function.prototype.ownCall = function (context, ...args) {
  context = typeof context === 'object' ? context : global;
  // 防止覆盖掉原有属性
  const key = Symbol(); // 每个从Symbol函数返回的值都是唯一的
  // 这里的this为需要执行的方法;this ===> fun
  context[key] = this;
  // 方法执行
  const result = context[key](...args);
  delete context[key];
  return result;
};
Function.prototype.ownApply = function (context, args) {
  context = typeof context === 'object' ? context : global;
  const key = Symbol();
  context[key] = this;
  // 方法执行
  const result = context[key](...args);
  delete context[key];
  return result;
};

Function.prototype.ownBind = function (context) {
  context = typeof context === 'object' ? context : global;
  return (...args) => {
    this.call(context, ...args);
  };
};

// 验证样例
function fun(arg1, arg2) {
  console.log(this.name);
  console.log(arg1 + arg2);
}
const _this = { name: 'YIYING' };
// 接受的是一个参数列表;方法立即执行
fun.ownCall(_this, 1, 2);
