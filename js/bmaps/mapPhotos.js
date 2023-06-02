(function () {
  "use strict";
  /**
 * Factory for map mapPhotos

 

 July 2017

	*************************************************************

 Available methods:

	- init
			initializes module
				@param token (string)
				@param app_name (string)

	- addPhoto
			adds photo id to list and compass info to list

				@param photo_id (string)
				@param heading (int)

	- getPhotoList
			returns uploaded photos list

	- getCompassList
			returns uploaded compass list

	- resetLists
			resets compass and photos lists

	- showPhoto
			returns binary photo

				@param ajax_target (url)
				@param photo_id (string)
				@param cbOk (function)
				@param cbKo (function)

	- deletePhoto
			removes a photo from db

				@param ajax_target (url)
				@param photo_id (string)
				@param layer_name (string)
				@param pol_id (string)
				@param tableIdName (string)
				@param cbOk (function)
				@param cbKo (function)

 - savePicture
			saves a photo in db

				@param ajax_target (url)
				@param photo_id (string)
				@param visit_id (string)
				@param preview (string)
				@param cbOk (function)
				@param cbKo (function)

*/

  angular.module("app").factory("mapPhotos", [
    "$http",
    "$rootScope",
    function ($http, $rootScope) {
      var filename = "mapPhotos.js",
        version = "1.0.0",
        app_name = null,
        token = null,
        images_listForInsert = Array(), //internal array with mongoid of photos
        compass_listForInsert = Array(); //compass heading for photos
      // public API
      var dataFactory = {
        init: init,
        addPhoto: addPhoto,
        getPhotoList: getPhotoList,
        getCompassList: getCompassList,
        resetLists: resetLists,
        getLists: getPhotosAndCompassLists,
        showPhoto: showPhoto,
        deletePhoto: deletePhoto,
        savePicture: savePicture,
      };
      return dataFactory;

      //****************************************************************
      //***********************       INIT       ***********************
      //****************************************************************

      function init(_token, _app_name) {
        token = _token;
        app_name = _app_name;

        log("init(" + _token + "," + _app_name + ")", "info");
      }

      //****************************************************************
      //***********************      END INIT    ***********************
      //****************************************************************

      //****************************************************************
      //********************        RESET LISTS         ****************
      //****************************************************************

      function resetLists() {
        log("resetLists()", "info");
        images_listForInsert = Array();
        compass_listForInsert = Array();
      }
      //****************************************************************
      //******************        END  RESET LISTS      ****************
      //****************************************************************

      //****************************************************************
      //********************         ADD PHOTO          ****************
      //****************************************************************

      function addPhoto(photo_id, heading) {
        log("addPhoto(" + photo_id + "," + heading + ")", "info");
        images_listForInsert.push(photo_id);
        compass_listForInsert.push(heading);
      }
      //****************************************************************
      //******************        END ADD PHOTO         ****************
      //****************************************************************

      //****************************************************************
      //********************     GET PHOTOS LIST        ****************
      //****************************************************************

      function getPhotoList() {
        log("getPhotoList()", "info", images_listForInsert);
        return images_listForInsert;
      }
      //****************************************************************
      //******************        END PHOTOS LIST       ****************
      //****************************************************************

      //****************************************************************
      //********************     GET COMPASS LIST        ***************
      //****************************************************************

      function getCompassList() {
        log("getCompassList()", "info", compass_listForInsert);
        return compass_listForInsert;
      }
      //****************************************************************
      //******************        END COMPASS LIST       ***************
      //****************************************************************

      //****************************************************************
      //******************     PHOTOS & COMPASS LIST     ***************
      //****************************************************************

      function getPhotosAndCompassLists() {
        log("getPhotosAndCompassLists()", "info");
        var _return = {
          photos: getPhotoList(),
          compasses: getCompassList(),
        };
        return _return;
      }

      //****************************************************************
      //****************   END PHOTOS & COMPASS LIST     ***************
      //****************************************************************

      //****************************************************************
      //********************         SAVE PHOTO         ****************
      //****************************************************************

      function savePicture(
        ajax_target,
        visit_id,
        preview,
        layer,
        metaData,
        callback
      ) {
        log(
          "savePicture(" + ajax_target + "," + visit_id + "," + layer + ")",
          "info",
          { metaData: metaData }
        );
        var data2send = new FormData();
        data2send.append("visit_id", visit_id);
        data2send.append("layer", layer);
        data2send.append("what", "ADD_IMAGE");
        data2send.append("token", token);
        data2send.append("metaData", metaData);
        if (preview) {
          data2send.append("file", preview);
        }

        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("savePicture() result:", "success", data);
            if (data.status === "Accepted") {
              callback(null, visit_id, data.message);
            } else {
              callback(
                "Error requesting savePicture",
                "Error requesting savePicture",
                data
              );
            }
          })
          .error(function (error) {
            callback(error, "Error requesting savePicture", error);
          });
      }

      //****************************************************************
      //******************        END SAVE PHOTO        ****************
      //****************************************************************

      //****************************************************************
      //********************         SHOW PHOTO         ****************
      //****************************************************************

      function showPhoto(ajax_target, photo_id, cbOk, cbKo) {
        log("showPhoto(" + photo_id + ")", "info");
        var noCache = Math.floor(Math.random() * 100 + 1);
        $http
          .get(ajax_target + photo_id + "&nocache=" + noCache, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            cbOk(data, noCache);
            /*if(data.status==="Failed"){
				displayMapError({err: "Error requesting showPhoto"});
			}*/
          })
          .error(function (error) {
            log("error in showPhoto", "error", error);
            cbKo("Error in showPhoto");
          });
      }

      //****************************************************************
      //******************        END SHOW PHOTO        ****************
      //****************************************************************

      //****************************************************************
      //******************          DELETE PHOTO        ****************
      //****************************************************************

      function deletePhoto(
        ajax_target,
        photo_id,
        layer_name,
        pol_id,
        tableIdName,
        cbOk,
        cbKo
      ) {
        log("deletePhoto(" + photo_id + ")", "info");
        var data2send = new FormData();
        data2send.append("feature_id", pol_id);
        data2send.append("img_id", photo_id);
        data2send.append("layer", layer_name);
        data2send.append("what", "REMOVE_IMAGE");
        data2send.append("token", token);
        data2send.append("tableIdName", tableIdName);
        $http
          .post(ajax_target, data2send, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .success(function (data) {
            log("deletePhoto() result:", "success", data);
            if (data.status === "Accepted") {
              cbOk(photo_id);
            } else {
              cbKo("error requesting deletePhoto: ", data);
            }
          })
          .error(function (error) {
            log("error requesting deletePhoto: " + error, "error");
            cbKo("error requesting deletePhoto: " + error, null);
          });
      }

      //****************************************************************
      //******************        END DELETE PHOTO      ****************
      //****************************************************************

      //****************************************************************
      //***********************      HELPERS      **********************
      //****************************************************************

      //log function
      function log(evt, level, data) {
        $rootScope.$broadcast("logEvent", {
          evt: evt,
          extradata: data,
          file: filename + " v." + version,
          level: level,
        });
      }

      //****************************************************************
      //***********************    END HELPERS    **********************
      //****************************************************************
    },
  ]);
})();
