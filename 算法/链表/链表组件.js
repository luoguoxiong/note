/*
head: 0->1->2->3
G = [0, 1, 3]
输出: 2

输入: 
head: 0->1->2->3->4
G = [0, 3, 1, 4]
输出: 2
解释: 
链表中，0 和 1 是相连接的，3 和 4 是相连接的，所以 [0, 1] 和 [3, 4] 是两个组件，故返回 2。

*/
var numComponents = function (head, G) {
  var myset = new Set(G);
  var flag = false;
  var count = 0;
  while (head) {
    if (myset.has(head.val)) {
      flag = true;
      if (head.next === null) {
        count++;
      }
    } else {
      if (flag === true) {
        count++;
        flag = false;
      }
    }
    head = head.next;
  }
  return count;
};
