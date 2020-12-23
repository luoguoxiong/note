Array.prototype.filter = function (callback, thisArg) {
  const res = [];
  const O = this;
  for (let i in O) {
    if (callback.call(thisArg, O[i], i, O)) {
      res.push(this[i]);
    }
  }
  return res;
};

const a = [1, 2, 3].filter((item, index, arr) => {
  console.log(item, index, arr);
  return item > 2;
});

console.log(a);
