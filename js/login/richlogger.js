/* jshint esversion: 6 */
/* eslint-disable no-undef*/
/* eslint-disable no-restricted-globals*/

export default class RichLogger {
  constructor(env, options) {
    this._version = '2.0.1';
    this._options = {};
    // colors
    this._warnColor = '#f57d00';
    this._infoColor = '#1c2aa6';
    this._successColor = '#07cb03';

    if (typeof env === 'undefined') {
      env = 'prod';
    }
    if (typeof options !== 'undefined') {
      this._options = options;
    }
    if (typeof this._options.baseHref !== 'undefined') {
      this._baseHref = _options.baseHref;
    } else {
      this._baseHref = null;
    }
    if (typeof this._options.token !== 'undefined') {
      this._token = _options.token;
    } else {
      this._token = null;
    }
    // colors
    if (typeof this._options.infoColor !== 'undefined') {
      this._infoColor = _options.infoColor;
    }
    if (typeof this._options.warnColor !== 'undefined') {
      this._warnColor = _options.warnColor;
    }
    if (typeof this._options.successColor !== 'undefined') {
      this._successColor = _options.successColor;
    }
    this._env = env;
    if (this._env === 'dev') {
      console.info(`%cRichLogger.js: loaded v. ${this._version}`, `color: ${ this._infoColor };`);
    }
  }
  info(module, msg, optionalArg) {

    if (this._env === 'dev') {
      if (typeof optionalArg === 'undefined') {
        console.info(`%c${module}: ${msg}`, `color: ${ this._infoColor };`);
      } else {
        console.info(`%c${module}: ${msg}`, `color: ${ this._infoColor };`, optionalArg);
      }
    }
  }

  log(moduleName, msg, extradata) {
    if (this._env === 'dev') {
      if (typeof extradata !== 'undefined') {
        console.log(`${moduleName}: ${msg}`, extradata);
      } else {
        console.log(`${moduleName}: ${msg}`);
      }
    }
  }

  warn(module, msg, optionalArg) {
    if (this._env === 'dev') {
      if (typeof optionalArg === 'undefined') {
        console.warn(`%c${module}: ${msg}`, `color: ${ this._warnColor };`);
      } else {
        console.warn(`%c${module}: ${msg}`, `color: ${ this._warnColor };`, optionalArg);
      }
    }
  }

  success(module, msg, optionalArg) {
    if (this._env === 'dev') {
      if (typeof optionalArg === 'undefined') {
        console.log(`%c${module}: ${msg}`, `color: ${ this._successColor };font-weight: bold;`);
      } else {
        console.log(`%c${module}: ${msg}`, `color: ${ this._successColor };font-weight: bold;`, optionalArg);
      }
    }
  }

  error(module, msg, optionalArg) {
    if (this._env === 'dev') {
      if (typeof optionalArg === 'undefined') {
        console.error(module, msg);
      } else {
        console.error(module, msg, optionalArg);
      }
    }
  }


}
