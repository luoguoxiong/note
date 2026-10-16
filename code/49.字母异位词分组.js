/*
 * @lc app=leetcode.cn id=49 lang=javascript
 *
 * [49] 字母异位词分组
 */

// @lc code=start
/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  const map = new Map();
  for (let index = 0; index < strs.length; index++) {
    const element = strs[index];
    const sortKey = element.split('').sort().join('');
    if (map.has(sortKey)) {
      map.get(sortKey).push(element);
    } else {
      map.set(sortKey, [element]);
    }
  }
  return Array.from(map.values());
};
// @lc code=end
