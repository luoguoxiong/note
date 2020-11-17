const nums = [11, 3, 15, 6];
const tag = 9;

function getNumArr(arr, target) {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    const targetVal = target - arr[i];
    if (obj[targetVal] !== undefined) {
      return [i, obj[targetVal]];
    } else {
      obj[arr[i]] = i;
    }
  }
}

console.log(getNumArr(nums, tag));
