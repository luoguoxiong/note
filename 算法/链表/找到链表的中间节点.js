// https://leetcode-cn.com/problems/middle-of-the-linked-list/solution/di-gui-shu-zu-xun-huan-shuang-zhi-zhen-1xing-dai-m/
// 快慢指针
// [1,2,3,4,5] ===>3
var middleNode = function (head, p = head) {
  var head;
  while (p && p.next) {
    head = head.next;
    p = p.next.next;
  }
  return head;
};
