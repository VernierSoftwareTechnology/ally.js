/*
    Facility to cache test results in localStorage.

    USAGE:
      cache.get('key');
      cache.set('key', 'value');
 */

import version from '../version';

function readLocalStorage(key) {
  // allow reading from storage to retrieve previous support results
  // even while the document does not have focus
  let data;
  data = {};
  return data;
}

function writeLocalStorage(key, value) {
  return
}

const userAgent = '';
const cacheKey = 'ally-supports-cache';
let cache = readLocalStorage(cacheKey);

// update the cache if ally or the user agent changed (newer version, etc)
if (cache.userAgent !== userAgent || cache.version !== version) {
  cache = {};
}

cache.userAgent = userAgent;
cache.version = version;

export default {
  get: function getCacheValue(key) {
    return cache[key];
  },
  set: function setCacheValue(key, value) {
    cache[key] = value;
    writeLocalStorage(cacheKey, cache);
  },
};
