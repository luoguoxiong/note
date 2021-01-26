var arr = [[1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14]]]], 10];

// arr = arr
//   .toString()
//   .split(',')
//   .sort((a, b) => {
//     return a - b;
//   });

// console.log(arr);

Array.prototype.falt = function () {
  return [].concat(...this.map((item) => (Array.isArray(item) ? item.falt() : [item])));
};

Array.prototype.unique = function () {
  return [...new Set(this)];
};

const sort = (a, b) => a - b;

console.log(arr.falt().unique().sort(sort)); // [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]

const isHui = (str) => {
  return str.split('').reverse().join('') === str;
};

const changeNum = (num) => {
  const nums = [];
  for (let i = 1; i < num; i++) {
    if (isHui(`${i}`)) {
      nums.push(i);
    }
  }
  return nums;
};
console.log(changeNum(1000));
