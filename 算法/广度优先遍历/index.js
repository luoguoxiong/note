const data = {
  label: '1',
  children: [
    {
      label: '1-1',
      children: [
        { label: '1-1-1', children: [] },
        { label: '1-1-2', children: [] },
      ],
    },
    {
      label: '1-2',
      children: [
        { label: '1-2-1', children: [] },
        { label: '1-2-2', children: [] },
      ],
    },
    {
      label: '1-3',
      children: [
        { label: '1-3-1', children: [] },
        { label: '1-3-2', children: [] },
      ],
    },
  ],
};

function Tree2(data) {
  const stack = [];
  const nodes = [];
  stack.push(data);
  while (stack.length) {
    item = stack.shift();
    nodes.push(item.label);
    for (let i = 0; i < item.children.length; i++) {
      stack.push(item.children[i]);
    }
  }
  return nodes;
}

const node = Tree2(data);
console.log(JSON.stringify(node));
