# IPA Server

A Node.js module to install iOS application on your devices from your desktop.
It's actually just made for my personal use, so it's just tested on W8.1 and works for me.
IT'S CLEARLY NOT MADE FOR PRODUCTION.

![web preview] (./assets/webview.jpg?raw=true)

## Getting Started
Install the module with: `npm install -g ipaserver`

```javascript
var ipaserver = require('ipaserver');
ipaserver.start();
```

## Documentation
Be careful with the depth of the recursing search, it's not optimized and can use a lot of memory.

```bash
$ ipaserver [-p port] [-a address] [-d depthRecursing] [/path/to/IPAs/folder]
```

## Examples

Default usage (your first ip4 found on ethernet on port 3000
```bash
/your/path/to/IPAs/folder:$ ipaserver
```

Or where you want:
```bash
$ ipaserver -p 80 -a 192.168.0.1 -d 4 /path/to/IPAs/folder
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Valéry Herlaud. Licensed under the MIT license.
