/**
 * Get diff from git data
 *
 * @param {String} data
 * @param {Function} callback
 *
 * Return diff object array like this.
 * [{
 *   path: 'index.html',
 *   chunks: [{
 *     num: '-0,3 +0,5',
 *     body: 'diff body'
 *   }..]
 * }..];
 *
 */

var each = require('async').eachSeries;

module.exports = function (data, cb) {
  var result = [];
  var files = data.split(/diff\s/).slice(2);

  each(files, function (file, next) {
    var f = {};

    f.chunks = [];
    f.path = file.match(/--git\sa\/((?:\w|\/|\.)+)/)[1];

    var chunks = file.split(/(@@\s([-\+\d,\s]+)\s@@)/);

    for (var i = 0; i < (chunks.length - 1) / 3; i++) {
      var chunk = {};
      var num = chunks[i * 3 + 2];
      var body = chunks[i * 3 + 3];

      chunk.num = num;
      chunk.body = body.slice(body.indexOf('\n') + 1);

      f.chunks.push(chunk);
    }

    result.push(f);

    next();
  }, function (err) {
    if (err) throw err;

    cb(result);
  });
};
