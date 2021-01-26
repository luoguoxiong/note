Array.prototype.flat = function () {
  return [].concat(...this.map((item) => (Array.isArray(item) ? item.flat(item) : [item])));
};

// const arr = [1, [2, 3]];
// console.log(arr.flat());

Array.prototype.unique = function () {
  return [...new Set(this)];
};
// const arr = [1, 2, 2, 1, 3];
// console.log(arr.unique());

Array.prototype.filter = function (callback, context) {
  const res = [];
  for (let i = 0; i < this.length; i++) {
    if (callback.call(context, this[i], i, this)) {
      res.push(this[i]);
    }
  }
  return res;
};

// const arr = [1, 2, 3];
// console.log(arr.filter((item) => item > 2));
