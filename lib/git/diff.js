var each = require('async').eachSeries;

module.exports = function (data, cb) {
  var result = [];
  var diffs = data.split(/diff\s/).slice(2);

  each(diffs, function (diff, next) {
    var file = {};

    file.diff = [];
    file.path = diff.match(/--git\sa\/((?:\w|\/|\.)+)/)[1];

    var chunks = diff.split(/(@@\s([-\+\d,\s]+)\s@@)/);

    for (var i = 0; i < (chunks.length - 1) / 3; i++) {
      var chunk = {};
      var num = chunks[i * 3 + 2];
      var body = chunks[i * 3 + 3];

      chunk.num = num;
      chunk.body = body.slice(body.indexOf('\n') + 1);

      file.diff.push(chunk);
    }

    result.push(file);

    next();
  }, function (err) {
    if (err) throw err;

    cb(result);
  });
};
