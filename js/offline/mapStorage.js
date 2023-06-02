/* jshint esversion: 6 */
import localforage from 'localforage';
const _version = '2.0.0',
_script = 'mapStorage';

let _logger = null,
  _options = null,
  _localStorageSupport = false,
  _databaseName = null,
  isInitialized = false,
  _fs  = null,
 _self = null;

export default class MapStorage {
  constructor(options,events,logger) {
    _logger = logger;
    _self = this;
    _logger.info(_script+" v."+_version,"Loaded",options);
    if (typeof options.localForageVersion === 'undefined') {
      options.localForageVersion = '2.0';
    }
    if (typeof options.storeName === 'undefined') {
      options.storeName = 'bmaps-default';
    }
    var getUrl  = window.location;
    _databaseName = getUrl .protocol + "//" + getUrl.host + "/";
    try {
      window.localStorage.getItem('testkey');
      _localStorageSupport = true;
    } catch (e) {
      _logger.warn(_script+" v."+_version,"No localStorage support");
    }
    _options = options;
    _self.initLocalForage(_options);
  }

  closeLocalforage(){
    _logger.info(_script+" v."+_version,"closeLocalforage()");
    isInitialized = false;
  }

  initLocalForage(options){
    _logger.info(_script+" v."+_version,"initLocalForage()",{'databaseName':_databaseName,'storeName':options.storeName,'localForageVersion':options.localForageVersion});
    if (!isInitialized && localforage) {
      localforage.config({
        name: _databaseName,
        storeName: options.storeName,
        size: 50 * 1024 * 1024, // Only use by webSQL
        version: options.localForageVersion,
        description: 'Storage for '+_databaseName
      });
      var requestedBytes = 1024*1024*1000; // 1GB
      navigator.webkitPersistentStorage.requestQuota (requestedBytes, (grantedBytes) => {
        _logger.success(_script+" v."+_version,`granted ${grantedBytes} bytes`);
        isInitialized = true;
      }, (e) => {
        _logger.error(_script+" v."+_version,'Error grantig space file system',e);
      });

      //file System
      window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024*1024 /*1GB*/, (fs) => {
        _logger.info(_script+" v."+_version,"Opened file system",fs);
        _fs = fs;
      }, (e)=> {
        _logger.error(_script+" v."+_version,"Error opening file system",e);
      });


    }
  }

  localStorageSpace(){
    _logger.info(_script+" v."+_version,"localStorageSpace()");
    return new Promise((resolve, reject) => {
      var data = '';
      var returnInfo = {};
      for(var key in window.localStorage){
        if(window.localStorage.hasOwnProperty(key)){
          data += window.localStorage[key];
        }
      }
      returnInfo.localStorageUsed = data.length;

      navigator.webkitTemporaryStorage.queryUsageAndQuota (
       function(usedBytes, grantedBytes) {
        returnInfo.indexDbUsedMb     = (usedBytes / (1024*1024)).toFixed(2);
        returnInfo.indexDbGrantedMb = (grantedBytes / (1024*1024)).toFixed(2);
        returnInfo.totalUsed = ((usedBytes+returnInfo.localStorageUsed )/ (1024*1024)).toFixed(2);
        returnInfo.localStorageUsed = ((returnInfo.localStorageUsed )/ (1024*1024)).toFixed(2);
        returnInfo.usedPercentage   = _self.usedPercentage(returnInfo.indexDbUsedMb,returnInfo.indexDbGrantedMb);
        //console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
        //console.log('we are using ', usedMb, ' of ', granteMb, 'MB');
        resolve(returnInfo);
       },
       function(e) {
         console.log('Error', e);
         reject(e);
        }
      );
    });
  }

  //****************************************************************
  //******************     fileSystem HELPERS      *****************
  //****************************************************************

  readFilesFromFileSystem() {
    _logger.info(_script+" v."+_version,"readFilesFromFileSystem()");
    return new Promise((resolve, reject) => {
      var dirReader = _fs.root.createReader();
      var entries = [];

      // Call the reader.readEntries() until no more results are returned.
      var readEntries = function() {
       dirReader.readEntries (function(results) {
         if (!results.length) {
          resolve(entries.sort());
        } else {
          entries = entries.concat(_self.toArray(results));
          readEntries();
        }


      }, function(e){
        _logger.error(_script+" v."+_version,"readFilesFromFileSystem() - error",e);
        reject(e);
      });
    };
    readEntries(); // Start reading dirs.
    });
  }

  resetFileSystem(){
    _logger.info(_script+" v."+_version,"resetFileSystem()");
  	_self.readFilesFromFileSystem().then((response)=>{
      response.forEach((entry, i) =>{
        _self.removeFileFromFileSystem(entry);
      });
    }).catch((e) =>{
      _logger.error(_script+" v."+_version,"resetFileSystem() error reading files",e);
    });
  }

  removeFileFromFileSystem(fileName){
    _logger.info(_script+" v."+_version,"removeFileFromFileSystem("+fileName+")");
  	_fs.root.getFile(fileName, {}, (fileEntry) => {
      fileEntry.remove(() => {
        _logger.success(_script+" v."+_version,"removeFileFromFileSystem("+fileName+") - File removed");
      }, (e) =>{
        _logger.error(_script+" v."+_version,"removeFileFromFileSystem("+fileName+") - error removing file", e);
  		});
    }, (e) => {
      _logger.warn(_script+" v."+_version,"removeFileFromFileSystem("+fileName+") - - could not find file", e);
  	});
  }

  //****************************************************************
  //***************    END fileSystem HELPERS      *****************
  //****************************************************************

  //****************************************************************
  //******************     indexedDB HELPERS      ******************
  //****************************************************************

  clearIndexedDb(){
    _logger.info(_script+" v."+_version,"clearIndexedDb()",_databaseName);
    var req = indexedDB.deleteDatabase(_databaseName);
    req.onsuccess = function () {
      _logger.success(_script+" v."+_version,"Deleted database successfully");
    };
    req.onerror = function () {
      _logger.error(_script+" v."+_version,"Couldn't delete database",e);
    };
    req.onblocked = function () {
      _logger.error(_script+" v."+_version,"Couldn't delete database due to the operation being blocke");
    };
  }

  //****************************************************************
  //****************    END indexedDB HELPERS      *****************
  //****************************************************************

  //****************************************************************
  //***************     LocalStorage HELPERS      ******************
  //****************************************************************

  clearLocalStorage(){
    _logger.info(_script+" v."+_version,"clearLocalStorage()");
    return window.localStorage.clear();
  }

  getItem(key) {
    if (_localStorageSupport) {
      return window.localStorage.getItem(key);
    }
  }

  setItem(key, data) {
    if (_localStorageSupport) {
      return window.localStorage.setItem(key, data);
    }
  }

  removeItem(key) {
    if (_localStorageSupport) {
      return window.localStorage.removeItem(key);
    }
  }

  //****************************************************************
  //***************    END LocalStorage HELPERS      ***************
  //****************************************************************

  //****************************************************************
  //***************      LocalForage HELPERS         ***************
  //****************************************************************

  setTile(key, dataURI) {
    _logger.info(_script+" v."+_version,`setTile(${key})`,dataURI);
    return new Promise((resolve, reject) => {
      if (isInitialized){
        localforage.setItem(key, dataURI).then(function (value) {
          _logger.success(_script+" v."+_version,`setTile(${key})`);
          resolve();
        }).catch(function(err) {
          _logger.error(_script+" v."+_version,`setTile(${key})`,err);
          reject(err);
        });
      }else{
        _logger.error(_script+" v."+_version,`setTile(${key})`,'localForage not initiated');
        reject('localForage not initiated');
      }
    });
  }

  getTile(key) {
    _logger.info(_script+" v."+_version,`getTile(${key})`,isInitialized);
		return new Promise((resolve, reject) => {
      if (isInitialized){
  		  localforage.getItem(key, (err, compressedDataURI) => {
         if(err){
           _logger.error(_script+" v."+_version,`getTile(${key})`,err);
           reject(err);
           return;
         }
          _logger.success(_script+" v."+_version,`getTile(${key})`,compressedDataURI);
  		   resolve(_self.decompress(compressedDataURI));
  		  });
      }else{
        _logger.error(_script+" v."+_version,`setTile(${key})`,'localForage not initiated');
        reject('localForage not initiated');
      }
    });
	}

  removeTile(key) {
    _logger.info(_script+" v."+_version,`removeTile(${key})`);
    return localforage.removeItem(key);
  }

  //****************************************************************
  //***************     END LocalForage HELPERS      ***************
  //****************************************************************

  //****************************************************************
  //***************     CacheStorage HELPERS      ******************
  //****************************************************************

  clearCacheStorage(version){
    _logger.info(_script+" v."+_version,"clearCacheStorage("+version+")");
    caches.open(version).then(function(cache) {
      cache.keys().then(function(keys) {
        keys.forEach(function(request, index, array) {
          cache.delete(request);
        });
      });
    });
  }

  //****************************************************************
  //***************    END CacheStorage HELPERS    *****************
  //****************************************************************

  //****************************************************************
  //***********************       HELPERS     **********************
  //****************************************************************

  usedPercentage(used,total){
    return ((100*used)/total).toFixed(2);
  }

  compress(s) {
    if (!s) {
          return s;
      }
    var i, l, out = '';
    if (s.length % 2 !== 0) {
          s += ' ';
        }
    for (i = 0, l = s.length; i < l; i += 2) {
          out += String.fromCharCode((s.charCodeAt(i) * 256) + s.charCodeAt(i + 1));
        }
    return String.fromCharCode(9731) + out;
    };

  decompress(s) {
    if (!s) {
      return s;
    }
    var i, l, n, m, out = '';
    if (s.charCodeAt(0) !== 9731) {
      return s;
    }
    for (i = 1, l = s.length; i < l; i++) {
      n = s.charCodeAt(i);
      m = Math.floor(n / 256);
      out += String.fromCharCode(m, n % 256);
    }
    return out;
  };

  toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
  }
  //****************************************************************
  //***********************    END HELPERS    **********************
  //****************************************************************

}
