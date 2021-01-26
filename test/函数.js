Function.prototype.applyNew = function (context, args) {
  // TypeError: new Symbol is not a constructor
  const sym = Symbol('fn');
  context[sym] = this;
  const res = context[sym](...args);
  return res;
};

Function.prototype.callNew = function (context, ...args) {
  const sym = Symbol('fn');
  context[sym] = this;
  const res = context[sym](...args);
  delete context[sym];
  return res;
};

function curry(fn) {
  const len = fn.length;
  const judge = (...args) => {
    if (args.length < len) {
      return (...arg) => judge(...arg, ...args);
    } else {
      return fn(...args);
    }
  };
  return judge;
}

const add = (a, b, c) => a + b + c;

console.log(curry(add)(1)(1, 2));
