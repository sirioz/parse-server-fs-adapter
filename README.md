# parse-server-fs-spread-adapter
[![Build Status](https://travis-ci.org/parse-server-modules/parse-server-fs-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-fs-adapter)
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-fs-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-fs-adapter?branch=master)

parse-server file system storage adapter, with a spread option.

[WORK IN PROGRESS, DO NOT USE] I added an option to spread files over N levels of subfolders, to speed up fetching and retrieval in case of many thousands of files. Default number of levels is 2, maximum is 8.
<br/>Example: image.jpg (file name MD5 = 0d5b1c4c7f720f698946c7f6ab08f687) will go in 0d/5b folder => 0d/5b/image.jpg.

# installation

`npm install --save https://github.com/sirioz/parse-server-fs-spread-adapter`

# usage with parse-server

### using a config file

```
{
  "appId": 'my_app_id',
  "masterKey": 'my_master_key',
  // other options
  "filesAdapter": {
    "module": "parse-server-fs-spread-adapter",
    "options": {
      "spread": true // spread files on 2 levels of folders
      "spreadDepth": 2 // spread depth (default=2, max=8)
      "filesSubDirectory": "my/files/folder" // optional
    } 
  }
}
```

### passing as an instance

```
var FSFilesAdapter = require('parse-server-fs-spread-adapter');

var fsAdapter = new FSFilesAdapter({
      "spread": true // spread files on 2 levels of folders
      "spreadDepth": 2 // spread depth (default=2, max=8)
      "filesSubDirectory": "my/files/folder" // optional
    });

var api = new ParseServer({
	appId: 'my_app',
	masterKey: 'master_key',
	filesAdapter: fsAdapter
})
```

