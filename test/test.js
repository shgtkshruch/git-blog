var assert = require('assert');
var fs = require('fs');
var getDiff = require('../lib/git/diff.js');

describe('git-blog', function () {

  describe('diff', function () {
    var diff;

    before(function (done) {
      var data = fs.readFileSync('./test/stub.txt', {encoding: 'utf-8'});
      getDiff(data, function (_diff) {
        diff = _diff;
        done();
      });
    });

    it('should have expected file path', function () {
      diff.forEach(function (file) {
        assert.deepEqual(file.fp, 'app/styles/style.scss');
      });
    });

    it('should have expected diff address', function () {
      diff.forEach(function (file) {
        file.diff.forEach(function (chunk) {
          assert.deepEqual(chunk.num, '-1,3 +1,4');
        });
      });
    });

    it('should have expected diff body', function () {
      diff.forEach(function (file) {
        file.diff.forEach(function (chunk) {
          assert.deepEqual(chunk.body, ' p {\n   color: red;\n+  font-size: 16px;\n }\n');
        });
      });
    });
  });
});
