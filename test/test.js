var fs = require('fs');
var assert = require('assert');
var getDiff = require('../lib/git/diff.js');
var createFiles = require('../lib/git/createFiles');
var rimraf = require('rimraf');

describe('git-blog', function () {
  var diff;

  before(function (done) {
    var data = fs.readFileSync('./test/stub.txt', 'utf8');
    getDiff(data, function (_diff) {
      diff = _diff;
      done();
    });
  });

  describe('diff', function () {

    describe('get diff from git data', function () {

      describe('scss', function () {
        var scss;

        before(function () {
          scss = diff[0];
        });

        it('should have expected file path', function () {
          assert.deepEqual(scss.path, 'app/styles/style.scss');
        });

        describe('chunk former', function () {
          var chunk;

          before(function () {
            chunk = scss.chunks[0];
          });

          it('should have expected diff address', function () {
            assert.deepEqual(chunk.num, '-1,3 +1,4');
          });

          it('should have expected diff body', function () {
            assert.deepEqual(chunk.body, ' p {\n   color: red;\n+  font-size: 16px;\n }\n');
          });
        });

        describe('chunk latter', function () {
          var chunk;

          before(function () {
            chunk = scss.chunks[1];
          });

          it('should have expected diff address', function () {
            assert.deepEqual(chunk.num, '-11,3 +11,4');
          });

          it('should have expected diff body', function () {
            assert.deepEqual(chunk.body, ' p {\n   color: red;\n-  font-size: 16px;\n }\n');
          });
        });
      });

      describe('html', function () {
        var html;

        before(function () {
          html = diff[1];
        });

        it('should have expected file path', function () {
          assert.deepEqual(html.path, 'app/index.html');
        });

        describe('chunk former', function () {
          var chunk;

          before(function () {
            chunk = html.chunks[0];
          });

          it('should have expected diff address', function () {
            assert.deepEqual(chunk.num, '-1,1 +1,2');
          });

          it('should have expected diff body', function () {
            assert.deepEqual(chunk.body, ' <p>Hello world</p>\n+ <p>Hello world</p>\n');
          });
        });

        describe('chunk latter', function () {
          var chunk;

          before(function () {
            chunk = html.chunks[1];
          });

          it('should have expected diff address', function () {
            assert.deepEqual(chunk.num, '-10,1 +10,2');
          });

          it('should have expected diff body', function () {
            assert.deepEqual(chunk.body, ' <h1>Hello world</h1>\n- <h2>Hello world</h2>\n');
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
