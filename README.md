# magnet-to-torrent
convert a magnet link to a torrent download link 

### Install 

```shell
npm install --save magnet-to-torrent
```
### How to use

```javascript
var magnetToTorrent = require('magnet-to-torrent');

var magnet = ' < a valid magnet uri > ';
magnetToTorrent.getLink(magnet)
    .then( function(torrentLink){
        console.log(torrentLink);
    })
    .fail(function(error){
        console.error(error)
    });
```

### Notes:

This is an experiment but should work fine. 

Report any issues.


### Credits

- to the author of [magnet2torrent](https://www.npmjs.com/package/magnet2torrent)
