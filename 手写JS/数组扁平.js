const arr = [1, [2, [3, [4, 5]]], 6];

const returnArr = [];
const parArr = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      parArr(arr[i]);
    } else {
      returnArr.push(arr[i]);
    }
  }
};
parArr(arr);
console.log(returnArr);
const newArr = (arr) => {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? newArr(cur) : cur);
  }, []);
};
console.log(newArr(arr));
