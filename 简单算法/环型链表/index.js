// 解法一 Map
var hasCycle = (head) => {
  let map = new Map();
  while (head) {
    if (map.has(head)) return true;
    map.set(head, true);
    head = head.next;
  }
  return false;
};
//   快慢指针
var hasCycle = (head) => {
  let fastP = head;
  let slowP = head;
  while (fastP) {
    if (fastP.next == null) return false;
    slowP = slowP.next;
    fastP = fastP.next.next;
    if (slowP == fastP) return true;
  }
  return false;
};
