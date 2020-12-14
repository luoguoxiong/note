// 给定一个链表: 1->2->3->4->5, 和 k = 2.
// 返回链表 4->5.

// 快慢指针，让fast先走k步，当fast到最后了，return slow
var getKthFromEnd = function (head, k) {
  let fast = head;
  let low = head;
  let n = 0;
  while (fast) {
    fast = fast.next;
    if (n >= k) {
      low = low.next;
    }
    n++;
  }
  return low;
};

var getKthFromEnd = function (head, k) {
  var len = 0;
  var cur = head;
  while (cur.next) {
    len++;
    cur = cur.next;
  }
  while (head.next) {
    if (len === k) {
      return head.next;
    }
    head = head.next;
    len--;
  }
};
