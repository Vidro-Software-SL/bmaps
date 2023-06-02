/* jshint esversion: 6 */
import axios from 'axios';
import {version} from './package';
import RichLogger from '../richLogger';
// import * as Source from 'ol/Source';

let _self = null,
  _options = null,
  _epsg = null,
  ol = null,
  sensibilityFactor = 3, // sensibility factor to increase tolerance on clic/touch
  _logger = null;

const _available_bg_layers = [];

var _mainBackgrounds = {
  bg_main: null,
  bg_secondary: null,
  bgInfo_main: null,
  bgInfo_secondary: null,
};

export default class bgsBmaps {
  constructor(options, _ol) {
    if (typeof options === 'undefined') {
      throw new TypeError('no data');
    }
    if (typeof options.baseHref === 'undefined') {
      throw new TypeError('no options baseHref');
    }
    if (typeof options.token === 'undefined') {
      throw new TypeError('no options token');
    }
    if (typeof options.project_id === 'undefined') {
      throw new TypeError('no options project_id');
    }
    if (typeof options.env === 'undefined') {
      options.env = 'prod';
    }
    ol = _ol;
    _self = this;
    _self._fileName = 'bg.js';
    _options = options;
    _logger = new RichLogger(options.env, {});
    _logger.info(_self._fileName, `Bmaps Backgrounds v.${version} loaded`);
    if (parseInt(_options.touchDevice, 10) !== 0) {
      sensibilityFactor = 20;
    }
  }

  setEpsg(epsg) {
    _logger.info(_self._fileName, `setEpsg(${epsg})`);
    _epsg = epsg;
  }

  setProjectBgsProperty(property, value) {
    _logger.info(_self._fileName, `setProjectBgsProperty(${property})`, value);
    _mainBackgrounds[property] = value;
  }

  getProjectBgsProperty(property) {
    _logger.info(_self._fileName, `getProjectBgsProperty(${property})`);
    return _mainBackgrounds[property];
  }

  loadProjectBgs() {
    _logger.info(_self._fileName, 'loadProjectBgs()');
    return new Promise((resolve, reject) => {
      const dataToSend = {};
      dataToSend.what = 'GET_BACKGROUNDS';
      dataToSend.project_id = _options.project_id;
      dataToSend.token = _options.token;
      axios.post(`${_options.baseHref}/ajax.projects.php`, dataToSend).then((response) => {
        _logger.success(_self._fileName, 'loadProjectBgs', response.data);
        if (response.data.status === 'Accepted') {
          for (var i = 0; i < response.data.message.length; i++) {
            if (response.data.message[i].assigned === true) {
              _available_bg_layers.push(response.data.message[i]);
            }
          }
          resolve(_available_bg_layers);
        } else {
          reject(response.data);
        }
      }).catch((error) => {
        _logger.error(_self._fileName, 'loadProjectBgs', error);
        reject(error);
      });
    });
  }

  getBackground(mapName) {
    _logger.info(_self._fileName, `getBackground(${mapName})`);
    const properties = _self._getBackgroundProperties(mapName);
    return new Promise((resolve, reject) => {
      if (typeof mapName === 'undefined') {
        reject(new Error('no mapName'));
      } else if (mapName.substring(0, 7) === 'custom_') {
        axios.get(`${_options.baseHref}/background.proxy.php?service=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`).then((response) => {
          _logger.success(_self._fileName, `getBackground ${mapName}`, response);
          var parser = new ol.format.WMTSCapabilities(),
            result = parser.read(response.data),
            options = ol.source.WMTS.optionsFromCapabilities(result, {
              layer: properties.layer,
              matrixSet: properties.matrixset,
              crossOrigin: 'anonymous'
            });
          options.urls[0] = `${_options.baseHref}background.proxy.php`;
          resolve(new ol.source.WMTS(options));
        }).catch((error) => {
          _logger.error(_self._fileName, `getBackground ${mapName}`, error);
          reject(error);
        });
      } else {
        switch (mapName) {
          case 'OSM':
            resolve(new ol.source.OSM());
            break;
          case 'CartoDBDark':
            resolve(new ol.source.XYZ({url: 'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'}));
            break;
          case 'CartoDBLight':
            resolve(new ol.source.XYZ({url: 'https://cartodb-basemaps-b.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', crossOrigin: 'Anonymous'}));
            break;
          case 'google':
            resolve(new ol.source.OSM({
              url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              attributions: [
                new ol.Attribution({ html: '© Google' }),
                new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
              ]
            }));
            break;
          case 'diba':
            resolve(_self._generateTileWMSsource({url: `http://sitmun.diba.cat/wms/servlet/BUE1M?layers=BUE1M_211L,BUE1M_111L,BUE1M_211P,BUE1M_111T,BUE1M_111P,BUE1M_311T&srs=${ _epsg}`}));
            break;
          case 'vol2016':
            resolve(_self._generateTileWMSsource({url: `https://192.168.21.48/cgi-bin/vol2016/qgis_mapserv.fcgi?layers=vol2016&srs=${ _epsg}`}));
            break;
          case 'vol2012':
            resolve(_self._generateTileWMSsource({url: `https://192.168.21.48/cgi-bin/vol2012/qgis_mapserv.fcgi?layers=vol2012&srs=${ _epsg}`}));
            break;
          case 'none':
            resolve(null);
            break;
          default:
            _self.setDynamicBg(mapName, properties).then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            });
            break;
        }
      }
    });
  }


  setDynamicBg(mapName, properties) {
    _logger.info(_self._fileName, `DynamicBg ${mapName}`, properties);
    return new Promise((resolve, reject) => {
      if (properties.type === 'WMS') {
        const opt = JSON.parse(properties.options);
        opt.url = `${properties.url}?srs=${ _epsg}`;
        resolve(new ol.source.TileWMS(opt));
      } else if (properties.type === 'WMTS') {
        axios.get(`${properties.url}?service=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`).then((response) => {
          _logger.success(_self._fileName, `DynamicBg ${mapName}`, response);
          var parser = new ol.format.WMTSCapabilities(),
            result = parser.read(response.data),
            options = ol.source.WMTS.optionsFromCapabilities(result, {
              layer: properties.layer,
              matrixSet: properties.matrixset,
              crossOrigin: 'anonymous'
            });
          options.urls[0] = properties.url;
          resolve(new ol.source.WMTS(options));
        }).catch((error) => {
          _logger.error(_self._fileName, `DynamicBg ${mapName}`, error);
          reject(error);
        });
      } else {
        reject(new Error('undefined type'));
      }
    });
  }

  // TBR to be removed!!!
  _generateTileWMSsource(obj) {
    return new ol.source.TileWMS(obj);
  }

  _getBackgroundProperties(id) {
    _logger.info(_self._fileName, `getBackgroundProperties(${id})`);
    for (var i = 0;i < _available_bg_layers.length;i++) {
      if (_available_bg_layers[i].id === id) {
        return _available_bg_layers[i];
      }
    }
  }

  getInfoFromBackground(bgId, source, coordinates, mapData) {
    _logger.info(_self._fileName, `getInfoFromBackground(${bgId})`, {'source': source, 'coordinates': coordinates, 'mapData': mapData});
    return new Promise((resolve, reject) => {
      // build url based on database background properties
      var bgInfo = _self._getBackgroundProperties(bgId);
      if(bgInfo.info_options){
        try{
          var url = source.getGetFeatureInfoUrl(
              coordinates, Math.min(Math.max(mapData.viewResolution * sensibilityFactor, 1), 1), mapData.projection,
              JSON.parse(bgInfo.info_options));
          _logger.info(_self._fileName, 'getInfoFromBackground url', url);
          axios.get(`${_options.baseHref}/backgroundInfo.proxy.php?url=${url}`).then((response) => {
            _logger.success(_self._fileName, `getInfoFromBackground`, response);
            resolve(response.data);
          }).catch((error) => {
            _logger.error(_self._fileName, `getInfoFromBackground`, error);
            reject({'error': error,"type":'getGetFeatureInfoUrl'});
          });
        }catch(e){
          reject({'error': e,"type":'syntax'});
        }
      }else{
        reject({'error': 'info not available for this background',"type":'background'});
      }
    });

  }

}
window.bgsBmaps = bgsBmaps;
