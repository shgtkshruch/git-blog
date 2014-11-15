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
var log = spawn('git', ['log', '--pretty=oneline', '--reverse'], opt);
var catCommit = function (commitId) {
 return spawn('git', ['cat-file', 'commit', commitId], opt); 
};
var lsTree = function (treeId) {
  return spawn('git', ['ls-tree', treeId], opt);
};
var catFile = function (blobId) {
  return spawn('git', ['cat-file', 'blob', blobId], opt);
};

function commit (cmt) {
  str(catCommit(cmt.sha), function (data) {
    var sha = data.match(/^tree\s([\d\w]{40})(?:\nparent\s([\d\w]{40}))?(?:\n.+){2}\n\n(.+(?:\n\n.+)?)/);
    cmt.treeSha = sha[1];
    // cmt.parentSha = sha[2];
    cmt.msg = sha[3];
    tree(cmt);
  });
}

function tree (obj) {
  var istree = Boolean(obj.type === 'tree');
  var sha = istree ? obj.sha : obj.treeSha;

  str(lsTree(sha), function (_data) {
    var data = _data.split('\n').slice(0, -1);
    data.forEach(function (d) {
      var _obj = {};
      var info = d.match(/^\d{6}\s(\w+)\s([\d\w]{40})\t([.\d\w].+)$/);
      _obj.cmt = istree ? obj.cmt : obj.sha;
      _obj.type = info[1];
      _obj.sha = info[2];
      _obj.fp = istree ? obj.fp + '/' + info[3] : info[3];
      _obj.type === 'blob' ?  blob(_obj) : tree(_obj);
    });
  });
}

function blob (obj) {
  str(catFile(obj.sha), function (data) {
    delete obj.type;
    delete obj.sha;
    obj.content = data;
    console.log(obj);
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

getCommits(function (cmts) {
  cmts.forEach(function (cmt) {
    commit(cmt);
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
  git.stdout.on('data', function (data) {
    cb(toStr(data));
  });
}

function toStr (buf) {
  return new Buffer(buf).toString();
}

