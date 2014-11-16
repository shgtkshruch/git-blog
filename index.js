var util = require('util');
var spawn = require('child_process').spawn;
var async = require('async');
var user = 'shgtkshruch';
var repo = 'git-blog-demo';
var r = [];

function git (cmd, cb) {
  var opt = {cwd: __dirname + '/' + repo};
  var _git = spawn('git', cmd, opt);
  var buf = '';

  _git.stdout.on('data', function (data) {
    buf += data;
  });

  _git.on('close', function (code) {
    if (code !== 0) console.log('code', code);
    var data = new Buffer(buf).toString();
    cb(data);
  });
}

function clone () {
  var reponame = 'git@github.com:' + user + '/' + repo + '.git';
  git(['clone', reponame], function (data) {
    console.log(data);
  });
}

function getCommit (cmt, next) {
  git(['cat-file', 'commit', cmt.sha], function (data) {
    var stat = data.match(/^tree\s([\d\w]{40})(?:\n.+){2,3}\n\n(.+(?:\n\n.+)?)/);
    cmt.ish = stat[1];
    cmt.msg = stat[2];
    getBlobs(cmt, next);
  });
}

function getBlobs (cmt, next) {
  var blobs = [];
  git(['ls-tree', '-r', cmt.ish], function (_data) {
    delete cmt.ish;
    var data = _data.split('\n').slice(0, -1);
    async.each(data, function (d, _next) {
      var blob = {};
      var stat = d.match(/^\d{6}\s\w+\s([\d\w]{40})\t([.\d\w].+)$/);
      blob.sha = stat[1];
      blob.fp = stat[2];
      getContent(blob, function (blob) {
        blobs.push(blob);
        _next();
      });
    }, function (err) {
      if (err) throw err;
      cmt.blobs = blobs;
      getDiff(cmt, function (diff) {
        cmt.diff = diff;
        r.push(cmt);
        next();
      });
    });
  });
}

function getContent (blob, cb) {
  git(['cat-file', 'blob', blob.sha], function (data) {
    delete blob.sha;
    blob.content = data;
    cb(blob);
  });
}

function getCommits (cb) {
  var commits = [];
  git(['log', '--reverse', '--pretty=oneline'], function (_data) {
    var data = _data.split('\n').slice(0, -1);
    async.eachSeries(data, function (d, next) {
      var cmt = {};
      cmt.sha = d.match(/^([\d\w]{40})/)[1];
      commits.push(cmt);
      next();
    }, function (err) {
      if (err) throw err;
      cb(commits);
    });
  });
}

function getDiff (cmt, cb) {
  git(['show', '--pretty=oneline', cmt.sha], function (data) {
    var diff = [];
    var diffs = data.split(/diff\s--git.+\n/).slice(1);
    async.eachSeries(diffs, function (dif, next) {
      var f = {};
      f.fp = dif.match(/\n[+-]{3}\sb\/(.+)\n/)[1];
      f.delta = dif.match(/@@\s([-\+\d,\s]+)\s@@/)[1];
      f.diff = '';
      var lines = dif.split('\n');
      async.eachSeries(lines, function (line, _next) {
        if (!/^[[+-]{3}|@@|new|index|]/.test(line)) {
          f.diff += line;
        }
        _next();
      }, function (err) {
        if (err) throw err;
        diff.push(f);
        next();
      });
    }, function (err) {
      if (err) throw err;
      cb(diff);
    });
  });
}

function run () {
  getCommits(function (commits) {
    async.eachSeries(commits, function (cmt, next) {
      getCommit(cmt, next);
    }, function (err) {
      if (err) throw err;
      console.log(util.inspect(r, {depth: 3}));
    });
  });
}

run();
