'use strict';

const logger = {
    debug: require('debug')('magnet-to-torrent:main'),
    error: require('debug')('magnet-to-torrent:error'),
};

const mguri = require('magnet-uri');
const needle = require('needle');
const Promise = require('bluebird');
const isFunction = require('lodash/isFunction');
const validator = require('validator');

const service = {};

const servUrl = [
    function(hash) {
        return `http://btcache.me/torrent/${hash}`;
    },
    function(hash) {
        return `http://bt.box.n0808.com/${hash.slice(0, 2)}/${hash.slice(-2)}/${hash}.torrent`;
    },
    function(hash){
        return `http://reflektor.karmorra.info/torrent/${hash}.torrent`;
    },
    function(hash) {
        return `http://torcache.net/torrent/${hash}.torrent`;
    },
    function(hash) {
        return `https://torrage.com/torrent/${hash}.torrent`;
    }
];

var parseInfoHash = function(uri) {
    if(uri){
        const uriObj = mguri.decode(uri);
        const hash = uriObj.infoHash || uri;
        if (/^[A-Za-z0-9]{40}$/.test(hash)) {
            return hash.toUpperCase();
        }
    }
};
service.isMagnet = function(uri) {
    return !!parseInfoHash(uri);
};
service.addService = function(serv, pushToFront) {
    if(isFunction(serv)){
        !pushToFront ? servUrl.push(serv) : servUrl.unshift(serv);
        logger.debug('Magnet conversion service added to stack!');
    }else{
        logger.debug('Magnet conversion service not added!');
    }
};

var verifyTorrent = function(url) {
    const options = { follow_max: 5 };
    const result = needle('head', url, options).then((response) => {
        if (!(response.statusCode >= 200 && response.statusCode < 300)) {
            const err = new Error(`Error response: ${response.statusCode}`);
            logger.error(err);
            return Promise.reject(err);
        }

        if (response.headers['content-type'] === 'application/octet-stream' ||
            response.headers['content-type'] === 'application/x-bittorrent') {
            return url;
        } else {
            const err = new Error(`Invalid content type: ${response.headers['content-type']}`);
            logger.error(err);
            return Promise.reject(err);
        }
    });
    return Promise.resolve(result);
};

service.getLink = function(uri) {
    const hash = parseInfoHash(uri);
    return new Promise((resolve, reject) => {
        if (!hash) {
            const err = new Error('Invalid magnet uri or info hash.');
            logger.error(err);
            return reject(err);
        }else{
            var getNext = function(x) {
                const attemptCount = x+1;
                logger.debug(`Magnet conversion attempt ${attemptCount}`);
                if (x < servUrl.length ) {
                    var torrentUrl = servUrl[x](hash);
                    if(validator.isURL(torrentUrl)){
                        logger.debug(`Attempting to check url: ${torrentUrl}`);
                        verifyTorrent(torrentUrl)
                            .then((url) => {
                                logger.debug(`Magnet conversion completed; result: ${url}`);
                                resolve(url);
                            })
                            .catch((err) => {
                                logger.error(err);
                                getNext(x+1);
                            });
                    }else{
                        getNext(x+1);
                    }
                } else {
                    logger.debug(`Magnet conversion failed for ${attemptCount} attempts`);
                    reject(new Error('Could not convert magnet link. All services tried.'));
                }
            };
            getNext(0);
        }
    });
};

module.exports = service;
