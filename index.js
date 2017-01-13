'use strict';
// FileSystemAdapter
//
// Stores files in local file system
// Requires write access to the server's file system.

var fs = require('fs');
var path = require('path');
var pathSep = require('path').sep;
var md5 = require('md5');

function FileSystemAdapter(options) {
  options = options || {};
  let filesSubDirectory = options.filesSubDirectory || '';
  this._spread = typeof options.spread === 'undefined' ? true : options.spread;
  if (this._spread) {
    this._spreadDepth = options.spreadDepth || 2;
  } else {
    this._spreadDepth = 0;
  }
  this._spreadDepth = Math.min(this._spreadDepth,8); // md5 hash is 16 chars long, then max depth is 8
  this._filesDir = filesSubDirectory;
  this._mkdir(this._getApplicationDir());
  if (!this._applicationDirExist()) {
    throw "Files directory doesn't exist.";
  }
  //console.log("parse-server-fs-spread-adapter initialized.")
}

FileSystemAdapter.prototype.createFile = function(filename, data) {
  return new Promise((resolve, reject) => {
    //let filepath = this._getLocalFilePath(filename);
    let filepath = this._getSpreadFilePath(filename,true);
    fs.writeFile(filepath, data, (err) => {
      if(err !== null) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

FileSystemAdapter.prototype.deleteFile = function(filename) {
  return new Promise((resolve, reject) => {
    //let filepath = this._getLocalFilePath(filename);
    let filepath = this._getSpreadFilePath(filename);
    fs.readFile( filepath , function (err, data) {
      if(err !== null) {
        return reject(err);
      }
      fs.unlink(filepath, (unlinkErr) => {
      if(err !== null) {
          return reject(unlinkErr);
        }
        resolve(data);
      });
    });

  });
}

FileSystemAdapter.prototype.getFileData = function(filename) {
  return new Promise((resolve, reject) => {
    //let filepath = this._getLocalFilePath(filename);
    let filepath = this._getSpreadFilePath(filename);
    fs.readFile( filepath , function (err, data) {
      if(err !== null) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

FileSystemAdapter.prototype.getFileLocation = function(config, filename) {
  return config.mount + '/files/' + config.applicationId + '/' + encodeURIComponent(filename);
}

/*
  Helpers
 --------------- */
 FileSystemAdapter.prototype._getApplicationDir = function() {
  if (this._filesDir) {
    if (path.isAbsolute(this._filesDir)) return this._filesDir;
    return path.join('files', this._filesDir);
  } else {
    return 'files';
  }
 }

FileSystemAdapter.prototype._applicationDirExist = function() {
  return fs.existsSync(this._getApplicationDir());
}

FileSystemAdapter.prototype._getSpreadFilePath = function(filename,create) {
  let hash = md5(filename);
  var spath = this._getApplicationDir();
  for (var i=0;i<this._spreadDepth;i++) {
    var folder = hash.substr(i*2, 2);
    spath = path.join(spath,folder);
  }
  if (create) {
    this._mkdir(spath);
  }
  return path.join(spath,filename);
}

FileSystemAdapter.prototype._getLocalFilePath = function(filename,create) {
  let applicationDir = this._getApplicationDir();
  if (!fs.existsSync(applicationDir)) {
    this._mkdir(applicationDir);
  }
  return path.join(applicationDir, encodeURIComponent(filename));
}

FileSystemAdapter.prototype._mkdir = function(dirPath) {
  // snippet found on -> https://gist.github.com/danherbert-epam/3960169
  let dirs = dirPath.split(pathSep);
  var root = "";

  while (dirs.length > 0) {
    var dir = dirs.shift();
    if (dir === "") { // If directory starts with a /, the first path will be an empty string.
      root = pathSep;
    }
    if (!fs.existsSync(path.join(root, dir))) {
      try {
        fs.mkdirSync(path.join(root, dir));
      }
      catch (e) {
        if ( e.code == 'EACCES' ) {
          throw new Error("PERMISSION ERROR: In order to use the FileSystemAdapter, write access to the server's file system is required.");
        }
      }
    }
    root = path.join(root, dir, pathSep);
  }
}

module.exports = FileSystemAdapter;
module.exports.default = FileSystemAdapter;
