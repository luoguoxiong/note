/*
 * @lc app=leetcode.cn id=1 lang=javascript
 *
 * [1] 两数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  const map = {};
  for (let index = 0; index < nums.length; index++) {
    const element = nums[index];
    const next = target - element;
    if (next in map) {
      return [map[next], index];
    }
    map[element] = index;
  }
};
// @lc code=end

// @after-stub-for-debug-begin
module.exports = twoSum;
// @after-stub-for-debug-end
