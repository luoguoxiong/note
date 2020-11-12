function calculator(type, a, b) {
  const strategy = {
    add: function (a, b) {
      return a + b;
    },
    minus: function (a, b) {
      return a - b;
    },
    division: function (a, b) {
      return a / b;
    },
    times: function (a, b) {
      return a * b;
    },
  };

  return strategy[type](a, b);
}

calculator('add', 1, 1);

function ShowController() {
  this.role = '';
  this.roleMap = {
    boss: function () {
      //   showPart1();
      //   showPart2();
      //   showPart3();
    },
    manager: function () {
      //   showPart1();
      //   showPart2();
    },
    staff: function () {
      //   showPart3();
    },
  };
}

ShowController.prototype.show = function () {
  axios.get('xxx').then((role) => {
    this.role = role;
    this.roleMap[this.role]();
  });
};

new ShowController().show();
