function stateFactor(state) {
  const stateObj = {
    status: '',
    state: {
      state1: function () {},
      state2: function () {},
    },
    run: function () {
      return this.state[this.status];
    },
  };

  stateObj.status = state;
  return stateObj;
}

stateFactor('state1').run();

function MoveController() {
  this.status = [];
  this.moveHanders = {
    up: () => {},
    dowm: () => {},
    left: () => {},
    right: () => {},
  };
}

MoveController.prototype.run = function (...args) {
  this.status = args;
  this.status.forEach((move) => {
    this.moveHanders[move]();
  });
};

new MoveController().run('left', 'up');
