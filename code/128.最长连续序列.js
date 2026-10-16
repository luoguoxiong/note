/*
 * @lc app=leetcode.cn id=128 lang=javascript
 *
 * [128] 最长连续序列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  let maxLenght = 0;
  const set = new Set(nums);
  for (const element of set) {
    let last = element - 1;
    if (!set.has(last)) {
      let curLen = 1;
      let cur = element;
      while (set.has(cur + 1)) {
        curLen += 1;
        cur += 1;
      }
      maxLenght = Math.max(curLen, maxLenght);
    }
  }
  return maxLenght;
};
// @lc code=end

// @after-stub-for-debug-begin
module.exports = longestConsecutive;
// @after-stub-for-debug-end
