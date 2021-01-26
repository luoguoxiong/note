// 输入: [0,1,0,3,12]
// 输出: [1,3,12,0,0]
// 必须在原数组上操作，不能拷贝额外的数组。

// 尽量减少操作次数。

const arr = [0, 1, 0, 3, 12, 0, 0, 18];
const moveO = (arr) => {
  let y = 0;
  for (let i = 0; i < arr.length - y; i++) {
    if (arr[i] === 0) {
      arr.splice(i, 1);
      arr.push(0);
      i--;
      y++;
    }
  }
  return arr;
};

console.log(moveO(arr));
