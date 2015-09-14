'use strict';

var mguri = require('magnet-uri');
var needle = require('needle');
var q = require('q'),
    _ = require('lodash'),
    validator = require('validator');

var service = {},
    servUrl = [
        function(hash) {
            return 'http://bt.box.n0808.com/' + hash.slice(0, 2) + '/' + hash.slice(-2) + '/' + hash + '.torrent';
        },
        function(hash){
            return 'http://reflektor.karmorra.info/torrent/' + hash + '.torrent';
        },
        function(hash) {
            return 'http://torcache.net/torrent/' + hash + '.torrent';
        },
        function(hash) {
            return 'https://torrage.com/torrent/' + hash + '.torrent';
        }
];

var parseInfoHash = function(uri) {
    if(uri){
        var uriObj = mguri.decode(uri);
        var hash = uriObj.infoHash || uri;
        if (/^[A-Za-z0-9]{40}$/.test(hash)) {
            return hash.toUpperCase();
        }
    }
};
service.validateMagnet = function(uri) {
    if(uri){
        var uriObj = mguri.decode(uri);
        var hash = uriObj.infoHash || uri;
        if (/^[A-Za-z0-9]{40}$/.test(hash)) {
            return true;
        }
    }
    return false;
};
service.addService = function(serv) {
    if(_.isFunction(serv)){
        servUrl.push(serv);
    }else{
        console.warn('Magnet conversion service not added!')
    }
};

var verifyTorrent = function(url, cb) {
    //console.log('Get torrent from:', url);

    var options = { follow_max: 5 };
    var stream = needle.get(url, options, function(error, response, body){
        if(error){
            cb(error);
        }else{
            if (response.statusCode === 200) {
                if (response.headers['content-type'] === 'application/octet-stream' ||
                    response.headers['content-type'] === 'application/x-bittorrent') {

                    cb(null, url);
                } else {
                    cb('Invalid content type: ' + response.headers['content-type']);
                }
            } else {
                cb('Error response: ' + response.statusCode);
            }
        }
    });
};

service.getLink = function(uri) {
    var hash = parseInfoHash(uri), d = q.defer();
    if (!hash) {
        d.reject('Invalid magnet uri or info hash.');
    }else{
        var getNext = function(x) {
            if (x < servUrl.length ) {
                var torrentUrl = servUrl[x](hash);
                if(validator.isURL(torrentUrl)){
                    verifyTorrent(torrentUrl, function(err, url) {
                        if (err) {
                            //console.log(err);
                            getNext(x+1);
                        } else {
                            d.resolve(url);
                        }
                    });
                }else{
                    getNext(x+1);
                }
            } else {
                d.reject('Could not convert magnet link. All services tried.');
            }
        };
        getNext(0);
    }
    return d.promise;
};

module.exports = service;