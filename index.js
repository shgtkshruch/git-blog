var spawn = require('child_process').spawn;
var util = require('util');
var async = require('async');
var user = 'shgtkshruch';
var repo = 'git-blog-demo';

function clone () {
  var reponame = 'git@github.com:' + user + '/' + repo + '.git';
  var gitClone = spawn('git', ['clone', reponame]);
  print(gitClone);
}

var opt = {cwd: __dirname + '/' + repo};
var log = spawn('git', ['log', '--reverse', '--pretty=oneline'] , opt);
var catCommit = function (commitId) {
 return spawn('git', ['cat-file', 'commit', commitId], opt); 
};
var lsTree = function (treeId) {
  return spawn('git', ['ls-tree', '-r', treeId], opt);
};
var catFile = function (blobId) {
  return spawn('git', ['cat-file', 'blob', blobId], opt);
};

function commit (cmt, next) {
  str(catCommit(cmt.sha), function (data) {
    var sha = data.match(/^tree\s([\d\w]{40})(?:\nparent\s([\d\w]{40}))?(?:\n.+){2}\n\n(.+(?:\n\n.+)?)/);
    cmt.treeSha = sha[1];
    cmt.msg = sha[3];
    tree(cmt, next);
  });
}

function tree (obj, next) {
  str(lsTree(obj.treeSha), function (_data) {
    var data = _data.split('\n').slice(0, -1);
    async.each(data, function (d, _next) {
      var _obj = {};
      var info = d.match(/^\d{6}\s\w+\s([\d\w]{40})\t([.\d\w].+)$/);
      _obj.cmt = obj.sha;
      _obj.sha = info[1];
      _obj.fp = info[2];
      blob(_obj, _next);
    }, function (err) {
      if (err) throw err;
      next();
    });
  });
}

function blob (obj, next) {
  str(catFile(obj.sha), function (data) {
    delete obj.sha;
    obj.content = data;
    console.log(obj);
    next();
  });
}

function getCommits (cb) {
  var commits = [];
  str(log, function (_data) {
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

getCommits(function (commits) {
  async.eachSeries(commits, function (cmt, next) {
    commit(cmt, next);
  }, function (err) {
    if (err) throw err;
  });
});

function print (git) {
  git.stdout.on('data', function (data) {
    console.log(toStr(data));
  });

  git.stderr.on('data', function (data) {
    console.log(toStr(data));
  });

  git.on('close', function (data) {
    console.log(data);
  });
}

function str (git, cb) {
  var buf = '';

  git.stdout.on('data', function (data) {
    buf += data;
  });

  git.on('close', function (code) {
    if (code !== 0) console.log('code', code);
    cb(toStr(buf));
  });
}

function toStr (buf) {
  return new Buffer(buf).toString();
}

