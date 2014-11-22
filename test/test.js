var assert = require('assert');
var fs = require('fs');
var getDiff = require('../lib/git/diff.js');
var createFiles = require('../lib/git/createFiles');
var rimraf = require('rimraf');

describe('git-blog', function () {
  var diff;

  before(function (done) {
    var data = fs.readFileSync('./test/stub.txt', {encoding: 'utf-8'});
    getDiff(data, function (_diff) {
      diff = _diff;
      done();
    });
  });

  describe('diff', function () {
    describe('get diff from git data', function () {
      it('should have expected file path', function () {
        diff.forEach(function (file) {
          assert.deepEqual(file.path, 'app/styles/style.scss');
        });
      });

      it('should have expected diff address', function () {
        diff.forEach(function (file) {
          file.chunks.forEach(function (chunk) {
            assert.deepEqual(chunk.num, '-1,3 +1,4');
          });
        });
      });

      it('should have expected diff body', function () {
        diff.forEach(function (file) {
          file.chunks.forEach(function (chunk) {
            assert.deepEqual(chunk.body, ' p {\n   color: red;\n+  font-size: 16px;\n }\n');
          });
        });
      });
    });

    describe('create files from diff data', function () {
      before(function (done) {
        diff.forEach(function (file) {
          createFiles(file);
          done();
        });
      });

      it('should create expeced files', function () {
        assert.deepEqual(fs.existsSync('./app/styles/style.html'), true);
      });
    });
  });

  after(function (done) {
    rimraf.sync('./app');
    done();
  });
});
