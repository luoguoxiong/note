function milkReducer(state = { milk: 2 }, action) {
  switch (action.type) {
    case 'PUT_MILK':
      return { ...state, milk: state.milk + action.count };
    case 'TAKE_MILK':
      return { ...state, milk: state.milk - action.count };
    default:
      return state;
  }
}
function countReducer(state = { count: 2 }, action) {
  switch (action.type) {
    case 'Add':
      return { ...state, count: state.count + action.count };
    case 'Del':
      return { ...state, count: state.count - action.count };
    default:
      return state;
  }
}
const createStore = (reducer, enhancer) => {
  if (Object.prototype.toString.call(enhancer) === '[object Function]') {
    return enhancer(createStore)(reducer); // 增强版store
  }
  let state;
  let listener = [];
  const dispatch = (action) => {
    state = reducer(state, action);
    listener.forEach((callback) => {
      callback();
    });
  };

  const getState = () => state;

  const subscribe = (callback) => {
    listener.push(callback);
  };

  return {
    dispatch,
    subscribe,
    getState,
  };
};

const combineReducers = (mapReducer) => {
  const newState = {};
  return (state = {}, action) => {
    for (let key in mapReducer) {
      let prevState = state[key];
      newState[key] = mapReducer[key](prevState, action);
    }
    return newState;
  };
};

const compose = (chain) => chain.reduce((prev, curent) => (args) => prev(curent(args)));

const applyMidware = (...midware) => {
  return (createStore) => {
    return (reducer) => {
      const store = createStore(reducer);
      const chain = midware.map((item) => item(store));
      const { dispatch, subscribe, getState } = store;
      const newDispatch = compose(chain);
      return {
        dispatch: newDispatch(dispatch),
        subscribe,
        getState,
      };
    };
  };
};

function logger(store) {
  return function (next) {
    return function (action) {
      console.log(11);
      next(action);
      console.log(33);
    };
  };
}

function logger2(store) {
  return function (next) {
    return function (action) {
      console.log(22);
      next(action);
      console.log(44);
    };
  };
}

// const a = (num) => {
//   console.log(num);
//   console.log('111');
//   return 1 + num;
// };
// const b = (num) => {
//   console.log('222');
//   return num - 2;
// };
// const c = compose([a, b]);
// c(2);

const reducer = {
  milk: milkReducer,
  count: countReducer,
};

const newReducer = combineReducers(reducer);

const { dispatch, subscribe, getState } = createStore(newReducer, applyMidware(logger, logger2));

subscribe(() => {
  console.log(getState());
});

dispatch({ type: 'PUT_MILK', count: 2 });
// dispatch({ type: 'Add', count: 2 });
