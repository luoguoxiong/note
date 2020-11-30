/*
[4,5,1,9]
5
==>[4,1,9]
*/
var deleteNode = function (head, val) {
  if (head.val === val) {
    return head.next;
  }
  let fast = head;
  let slow = head;
  while (fast.next && fast.val !== val) {
    slow = fast;
    fast = fast.next;
  }
  slow.next = fast.next;
  return head;
};

// 递归
var deleteNode = function (head, val) {
  if (head.val == val) {
    return head.next;
  }
  head.next = deleteNode(head.next, val);
  return head;
};
