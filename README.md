# magnet-to-torrent
convert a magnet uri to a torrent download link

### Install

```shell
npm install --save magnet-to-torrent
```
### How to use

```javascript
var magnetToTorrent = require('magnet-to-torrent');

var magnet = '< a valid magnet uri >';
magnetToTorrent.getLink(magnet)
    .then( function(torrentLink){
        console.log(torrentLink); // torrent url as string
    })
    .catch(function(error){
        console.error(error); // couldn't get a valid link
    });
```

### Check if URI is a Magnet URI

The following verifies if the magnet uri provided is formatted correctly.

```javascript
var bool = magnetToTorrent.isMagnet(magnet); // returns boolean
```

### Default Services Used

The library will attempt to retrieve a working torrent link from the following services, respectively:

- http://bt.box.n0808.com
- http://reflektor.karmorra.info
- http://torcache.net
- https://torrage.com

### Adding a Conversion Service

Each service takes in `hash` as a parameter and uses it to build the download link in the
format of how the said service allows a user to download torrents.
The library tests if the torrent is cached by the service and responds
with the first url that has the torrent available.

You can add your own service before attempting to convert magnets.

See snippet below.

eg.
```javascript
var service = function(hash){
    return `http://reflektor.karmorra.info/torrent/${hash}.torrent`;
};

magnetToTorrent.addService(service);

/**
 OR:
 Optionally, use a second parameter to push the service to the top of the stack
 This will ensure your service is called first
**/
magnetToTorrent.addService(service, true);
```

### Notes:

- `hash` is the torrent hash extracted from the magnet uri
- This is an experiment but should work fine.

Report any issues.


### Credits

- to the author of [magnet2torrent](https://www.npmjs.com/package/magnet2torrent)
