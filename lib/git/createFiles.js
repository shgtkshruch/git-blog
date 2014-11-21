var fs = require('fs');
var mkdir = require('mkdirp');
var each = require('async').eachSeries;

function markup (before, after, code) {
  return '<tr><td>' + before + '</td><td>' + after + '</td><td>' + code + '</td></tr>\n';
}

module.exports = function (file) {
  var dir = file.path.split('/').slice(0, -1).join('/');
  mkdir.sync(dir);

  each(file.diff, function (diff, _next) {
    var before = parseInt(f.num.split(' ')[0].slice(1));
    var after = parseInt(f.num.split(' ')[1].slice(1));
    var lines = diff.body.split(/\n/).slice(0, -1);

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
      console.log(line);
      fs.appendFileSync(file.path, line);
      next();
    }, function (err) {
      fs.appendFileSync(file.path, '\n');
      _next();
    });
  }, function (err) {
  });
};

