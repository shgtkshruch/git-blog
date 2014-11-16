var inspect = require('util').inspect;
var fs = require('fs');
var git = require('./git');
var mkdir = require('mkdirp');

git(function (commits) {
  createFiles(commits);
});

function createFiles (commits) {
  var test = 'test';
  fs.mkdirSync(test);
  commits.forEach(function (cmt) {
    var dir = test + '/' + cmt.sha;
    fs.mkdirSync(dir);
    cmt.blobs.forEach(function (blob) {
      if (/\//.test(blob.fp)) {
        mkdir.sync(dir + '/' + blob.fp.split('/').slice(0, -1).join('/'));
      }
      var ws = fs.createWriteStream(dir + '/' + blob.fp);
      ws.write(blob.content);
    });
  });
}

