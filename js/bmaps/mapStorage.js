
(function() {
	angular.module('app').factory('mapStorage', ['$http','$rootScope','$window', function ($http,$rootScope,$window) {
	/*
		* Service provides read/write/delete functions in local storages.
		*
		* There is 2 sets (get/set/remove) of functions:
		*   - one for tiles management. These functions use the mozilla localforage
		*   library (see http://github.com/mozilla/localForage). We use this library
		*   to get the maximum advantages of last HTML 5 offline storage features
		*   (indexedDb, webSQL, localStorage). See the api doc for more
		*   information http://mozilla.github.io/localForage/.
		*
		*   - one for basic localStorage. These functions are used to store simple
		*   string (homescreen popup, offline data informations).
		*
	*/

	// Strings management
		// LocalStorage creates a bug on IE >= 10 when security settings
		// are tight and don't permit writing on specific files. We put
		// it in try/catch to determine it here
		// See: http://stackoverflow.com/questions/13102116/access-denied
	var localStorageSupport = false;
	try {
		$window.localStorage.getItem('testkey');
		localStorageSupport = true;
	} catch (e) {
	}
	var getUrl 							= window.location;
	var databaseName        = getUrl .protocol + "//" + getUrl.host + "/";
	var isInitialized       = false;
	var _fs									= null;
	var filename						= "mapStorage.js";
	// public API
	var dataFactory 		= {

								init: 							init,
								getItem:						getItem,
								setItem:						setItem,
								removeItem:					removeItem,
								getTile:						getTile,
								setTile: 						setTile,
								clearTiles:					clearTiles,
								removeTile:					removeTile,
								decompress: 							decompress,
								compress:   							compress,
								clearDatabase: 						clearDatabase,
								clearCacheStorage:				clearCacheStorage,
								localStorageSpace:				localStorageSpace,
								writeFileOnFileSystem: 		writeFileOnFileSystem,
								readFileFromFileSystem: 	readFileFromFileSystem,
								removeFileFromFileSystem: removeFileFromFileSystem,
								resetFileSystem:					resetFileSystem

							};
	return dataFactory;

	//****************************************************************
	//***********************         METHODS   **********************
	//****************************************************************
	//log function
	function log(evt,level,data){
		$rootScope.$broadcast('logEvent',{evt:evt,extradata:data,file:filename,level:level});
	}
	function init(storeName) {
			log("init("+storeName+")","info");
		//OJO cOJO OJO chequea si es movil
				if (!isInitialized && $window.localforage) {
						$window.localforage.config({
							name: databaseName,
							storeName: storeName,
							size: 50 * 1024 * 1024, // Only use by webSQL
							version: '3.0',
							description: 'Storage for '+databaseName
						});
						// IE > 10, Safari, Chrome, Opera, FF -> indexeddb
						//
						// Exceptions:
						// Android default browser -> websql
						// iOS Chrome, Opera -> websql
						// iOS 7 Safari -> websql
						startFs(function(err,msg){
							if(err){
								return false
							}
							readFilesFromFileSystem(listResults);
						});


						//Request quota - It works????
						var requestedBytes = 1024*1024*1000; // 1GB
						navigator.webkitPersistentStorage.requestQuota (
							requestedBytes, function(grantedBytes) {
									log('we were granted '+grantedBytes+'bytes',"success");


							}, function(e) { 	log("Error grantig space file system","error",e); }
						);


						isInitialized = true;
				}
		};

	//******************** FILE SYSTEM ******************
	function errorHandler(e) {
		log("filesystem error","error",e)

	}

	function writeFileOnFileSystem(fileName,dataToSave,cb){
		log("writeFileOnFileSystem("+fileName+")","info",dataToSave);

		 //removeFileFromFileSystem(fileName)
		_fs.root.getFile(fileName, {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
				log("writeFileOnFileSystem - Write completed.","success");
        console.log('Write completed.');
				cb(null,"ok");
      };

      fileWriter.onerror = function(e) {
				log("writeFileOnFileSystem - error writing completed.","error",e.toString());
				cb(e.toString(),null);
      };

      // Create a new Blob and write it to log.txt.

			var blob = new Blob([dataToSave], {
						type: 'application/javascript'
					});
      fileWriter.write(blob);


    }, function(e){
			cb(e.toString(),null);
		});
	},  function(e){
		cb(e.toString(),null);
	});

}

function startFs(cb){
	//file System
	window.webkitRequestFileSystem(window.PERSISTENT, 1024*1024*1024 /*1GB*/, function(fs){
		log("Opened file system","info",fs);
		_fs = fs;
		cb(null,true);
	}, function(e) {
		log("Error opening file system","error",e);
		cb(e,false);
	});
}
function _doReadFile(fileName,cb){
	_fs.root.getFile(fileName, {}, function(fileEntry) {

			// Get a File object representing the file,
			// then use FileReader to read its contents.
			fileEntry.file(function(file) {
				 var reader = new FileReader();

				 reader.onloadend = function(e) {
					//console.log("mapStorage readFileFromFileSystem",this.result);
					var storedStyle = this.result;
					cb(null,storedStyle);
				 };

				 reader.readAsText(file);
			}, function(e){

				cb("Error reading file",null);
			});
	}, function(e){
		cb("file not found",null);
	});
}
function readFileFromFileSystem(fileName,cb){
	log("readFileFromFileSystem("+fileName+")","info");

	if(_fs===null){
		startFs(function(err,msg){
			if(err){
				cb("Error opening file system",null);
				return false;
			}
			_doReadFile(fileName,cb);
		});
	}else{
		_doReadFile(fileName,cb);
	}
}

function removeFileFromFileSystem(fileName){
	log("removeFileFromFileSystem("+fileName+")","info");

	_fs.root.getFile(fileName, {}, function(fileEntry) {

    fileEntry.remove(function() {
			log("removeFileFromFileSystem("+fileName+") - File removed","success");
    }, function(e){
			log("removeFileFromFileSystem("+fileName+") - error removing file","error",e);
		});

  }, function(e){
		log("removeFileFromFileSystem("+fileName+") - could not find file","warn",e);
	});
}

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}


function listResults(entries) {
	log("listResults()","info",entries);
  entries.forEach(function(entry, i) {
		//console.log("culo",entry)
  });
}

function deleteAllFiles(entries){
	log("deleteAllFiles()","info",entries);
	entries.forEach(function(entry, i) {
		removeFileFromFileSystem(entry.name)
	});

}

function readFilesFromFileSystem(cb) {
	log("readFilesFromFileSystem()","info");
  var dirReader = _fs.root.createReader();
  var entries = [];

  // Call the reader.readEntries() until no more results are returned.
  var readEntries = function() {
     dirReader.readEntries (function(results) {
			 if (!results.length) {
        cb(entries.sort());
      } else {
        entries = entries.concat(toArray(results));
        readEntries();
      }


    }, function(e){
			log("readFilesFromFileSystem() - error","error",e);
		});
  };

  readEntries(); // Start reading dirs.

}
function resetFileSystem(){
	log("resetFileSystem()","info");
	readFilesFromFileSystem(deleteAllFiles)
}
//******************** FILE SYSTEM ******************


	function getItem(key) {
		if (localStorageSupport) {
			return $window.localStorage.getItem(key);
		}
	}

	function setItem(key, data) {
		if (localStorageSupport) {
			return $window.localStorage.setItem(key, data);
		}
	};

	function removeItem(key) {
		if (localStorageSupport) {
			return $window.localStorage.removeItem(key);
			}
	}

	function getTile(key, callback) {
		if (!isInitialized) {
			return callback(null);
		}
		$window.localforage.getItem(key, function(err, compressedDataURI) {
			callback(err, decompress(compressedDataURI));
		});
	};

	function setTile(key, dataURI, callback) {
				//this.init();
		$window.localforage.setItem(key, dataURI, callback);
	};

	function removeTile(key, callback) {
		this.init();
		$window.localforage.removeItem(key, callback);
	};

	function clearTiles(callback) {
			this.init();
			$window.localforage.clear(callback);
	};

	function clearDatabase(){
		var req = indexedDB.deleteDatabase(databaseName);
		req.onsuccess = function () {
			console.log("Deleted database successfully");
		};
		req.onerror = function () {
			console.log("Couldn't delete database");
		};
		req.onblocked = function () {
			console.log("Couldn't delete database due to the operation being blocked");
		};
		$window.localStorage.clear();
	}

	function clearCacheStorage(version){
		console.log("clearCacheStorage("+version+")");
		caches.open(version).then(function(cache) {
		  cache.keys().then(function(keys) {
		    keys.forEach(function(request, index, array) {
		      cache.delete(request);
		    });
		  });
		});
	}
	//****************************************************************
	//***********************    END  METHODS   **********************
	//****************************************************************

	//****************************************************************
	//***********************        HELPERS    **********************
	//****************************************************************

	function compress(s) {
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

	function decompress(s) {
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

	function localStorageSpace(cb){
			var data 				= '';
			var returnInfo = {};
			for(var key in window.localStorage){
				if(window.localStorage.hasOwnProperty(key)){
					data += window.localStorage[key];

					//console.log( key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
				}
			}
			returnInfo.localStorageUsed = ((data.length * 16)/(8 * 1024)/1024).toFixed(2);
			//console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16)/(8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
			//console.log(data ? 'Approx. space remaining: ' + (5120 - ((data.length * 16)/(8 * 1024)).toFixed(2)) + ' KB' : '5 MB');
			navigator.webkitTemporaryStorage.queryUsageAndQuota (
			 function(usedBytes, grantedBytes) {
				returnInfo.indexDbUsedMb 		= (usedBytes / (1024*1024)).toFixed(2);
				returnInfo.indexDbGrantedMb = (grantedBytes / (1024*1024)).toFixed(2);
				returnInfo.usedPercentage 	= usedPercentage(returnInfo.indexDbUsedMb,returnInfo.indexDbGrantedMb);
				//console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
				//console.log('we are using ', usedMb, ' of ', granteMb, 'MB');
				cb(null,returnInfo)
			 },
			 function(e) {
				 console.log('Error', e);
				 cb(e,null);
				}
			);
	};

	function usedPercentage(used,total){
		return ((100*used)/total).toFixed(2);
	}
	//****************************************************************
	//***********************     END HELPERS    *********************
	//****************************************************************

	}]);

})();
