var calc = require("../lib/calc");

exports["calcula add"] = function(test) {
    test.equal(calc.add(1, 2), 3);
    test.done();
};
