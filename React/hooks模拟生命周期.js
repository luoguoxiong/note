function Component() {
  const [state, setstate] = useState(false);

  // componetnDidMount
  useEffect(() => {
    console.log('mount');
  }, []);

  useEffect(() => {
    console.log('updated');
  });

  useEffect(() => {
    return () => {
      console.log('will unmount');
    };
  }, []);
  return <div>@32</div>;
}

const PerComponent = React.memo(Component, (prevProps, nextProps) => {
  console.log('shouldComponentUpdate');
  // return true 更新组件
  // return false 则不更新组件
  return prevProps.count !== nextProps.count;
});
