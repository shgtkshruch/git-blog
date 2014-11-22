var fs = require('fs');
var path = require('path');
var mkdir = require('mkdirp');
var each = require('async').eachSeries;

function markup (before, after, code) {
  return '<tr><td>' + before + '</td><td>' + after + '</td><td>' + code + '</td></tr>\n';
}

module.exports = function (file) {
  var dir = path.dirname(file.path);
  var base = path.basename(file.path).replace(path.extname(file.path), '.html');
  var dest = path.join(dir, base);

  mkdir.sync(dir);

  each(file.chunks, function (chunk, _next) {
    var before = parseInt(chunk.num.split(' ')[0].slice(1));
    var after = parseInt(chunk.num.split(' ')[1].slice(1));
    var lines = chunk.body.split(/\n/).slice(0, -1);

    each(lines, function (code, next) {
      var line;
      switch (code[0]) {
        case '-':
          line = markup(before++, '', code);
          break;
        case '+':
          line = markup('', after++, code);
          break;
        default:
          line = markup(before++, after++, code);
      }
      fs.appendFileSync(dest, line);
      next();
    }, function (err) {
      fs.appendFileSync(dest, '\n');
      _next();
    });
  }, function (err) {
  });
};

