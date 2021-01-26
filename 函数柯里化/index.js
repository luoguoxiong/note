function add() {
  // 第一次执行时，定义一个数组专门用来存储所有的参数
  var _args = [].slice.call(arguments);

  // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值
  var adder = function () {
    var _adder = function () {
      _args.push(...arguments);
      return _adder;
    };

    // 利用隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
    _adder.toString = function () {
      return _args.reduce(function (a, b) {
        return a + b;
      });
    };

    return _adder;
  };
  // return adder.apply(null, _args);
  return adder(..._args);
}

var a = add(1)(2)(3)(4); // f 10
var b = add(1, 2, 3, 4); // f 10
var c = add(1, 2)(3, 4); // f 10
var d = add(1, 2, 3)(4); // f 10

// // 可以利用隐式转换的特性参与计算
console.log(a + 10); // 20

// function curry(fn, args) {
//   var length = fn.length; // 函数接收参数的长度
//   var args = args || [];
//   return function () {
//     newArgs = args.concat(Array.prototype.slice.call(arguments));
//     if (newArgs.length < length) {
//       return curry.call(this, fn, newArgs);
//     } else {
//       return fn.apply(this, newArgs);
//     }
//   };
// }

// 整合参数
const curry = (fn) => {
  const judge = (...args) =>
    fn.length === args.length ? fn(...args) : (...arg) => judge(...args, ...arg);
  return judge;
};

function multiFn(a, b, c) {
  return a * b * c;
}

var multi = curry(multiFn);

console.log(multi(2)(3)(4));
// // console.log(b + 20); // 30
// console.log(c + 30); // 40
// console.log(d + 40); // 50
