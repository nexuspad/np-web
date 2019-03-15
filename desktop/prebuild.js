'use strict'

var fs = require('fs')
var cpx = require('cpx');

var deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

deleteFolderRecursive('./app/static');
cpx.copySync('../dist/**', './app');

fs.readFile('app/index.html', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/\/static\//g, 'static/').replace('<head>', '<head><script>window.NP_DESKTOP=true;</script>');

  fs.writeFile('app/index.html', result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
