/* jshint esversion: 6 */
import { EventEmitter } from "events";
import axios from "axios";
import RichLogger from "./richLogger";
import { version } from "./package";
const _storeName = "bmaps_login";

let _self = null,
  _logger = null,
  _dbPromise = null,
  _domainName = null,
  _offlineLogin = false,
  _db = null;

export default class Login extends EventEmitter {
  constructor(options) {
    super();
    if (typeof options === "undefined") {
      throw new TypeError("no data");
    }
    if (typeof options.baseHref === "undefined") {
      throw new TypeError("no options baseHref");
    }
    if (typeof options.env === "undefined") {
      options.env = "prod";
    }
    if (typeof options.offlineLogin !== "undefined") {
      _offlineLogin = options.offlineLogin;
    }

    _logger = new RichLogger(options.env, {});

    _domainName = `${window.location.protocol}//${window.location.host}/`;
    _self = this;
    _self._version = version;
    _self._fileName = "login.js";
    _self._options = options;
    _logger.info(_self._fileName, `Module loaded v.${_self._version}`);

    if (typeof options.autologin !== "undefined") {
      var canAutoLogin = 2;
      if (typeof options.autologinUser !== "undefined") canAutoLogin--;
      if (typeof options.autologinPassword !== "undefined") canAutoLogin--;
      if (parseInt(options.autologin) === 1 && canAutoLogin === 0) {
        _logger.info(_self._fileName, "autologin");
        _self.doLogin(options.autologinUser, options.autologinPassword);
      }
    }

    if (_offlineLogin) {
      _logger.info(_self._fileName, "Offline login allowed");
      window.addEventListener("offline", () => {
        _logger.info(_self._fileName, "App offline");
        _self.netwoorkStatusIndicator("offline");
      });
      window.addEventListener("online", () => {
        _logger.success(_self._fileName, "App online");
        _self.netwoorkStatusIndicator("online");
      });
      if (navigator.onLine) {
        _self.netwoorkStatusIndicator("online");
      } else {
        _self.netwoorkStatusIndicator("offline");
      }
    }
  }

  doLogin(email, pwd) {
    if (typeof email === "undefined") {
      throw new TypeError("email error");
    }
    if (typeof pwd === "undefined") {
      throw new TypeError("pwd error");
    }
    _logger.info(_self._fileName, `doLogin(${email},xxxxx)`);
    const dataToSend = {};
    dataToSend.email = email;
    dataToSend.pwd = pwd;
    dataToSend.token = _self._options.token;

    if (navigator.onLine) {
      _logger.info(_self._fileName, "try ONLINE login");
      axios
        .post(`${this._options.baseHref}/login.php`, dataToSend)
        .then((response) => {
          _logger.info(_self._fileName, "doLogin", response.data);
          if (response.data.status === "Accepted") {
            _logger.success(_self._fileName, "doLogin valid");
            document.getElementById("loginError").style.display = "none";
            if (_offlineLogin) {
              try {
                var storeData = {
                  email: email,
                  offlineToken: response.data.offlineToken,
                  sessionToken: response.data.sessionToken,
                  redirect: response.data.message,
                  offlineKey: response.data.offlineKey,
                };
                localStorage.setItem(
                  `offlineLogin_${email}`,
                  JSON.stringify(storeData)
                );
                location.href = response.data.message;
              } catch (e) {
                _logger.error(_self._fileName, "error storing credentials", e);
                location.href = response.data.message;
              }
            } else {
              location.href = response.data.message;
            }
          } else {
            _logger.warn(_self._fileName, "doLogin invalid");
            document.getElementById("loginError").style.display = "block";
          }
        })
        .catch((error) => {
          _logger.error(_self._fileName, "doLogin", error);
          document.getElementById("loginError").style.display = "block";
        });
    } else {
      _logger.info(_self._fileName, "try OFFLINE login");
      document.getElementById("loginError").style.display = "none";
      var offlineCredentials = JSON.parse(
        localStorage.getItem(`offlineLogin_${email}`)
      );
      _logger.success(
        _self._fileName,
        "login data retrieved",
        offlineCredentials
      );
    }
  }

  syncroLogin(obj) {
    return new Promise((resolve, reject) => {
      if (_offlineLogin) {
        var offlineCredentials = JSON.parse(
          localStorage.getItem(`offlineLogin_${obj.email}`)
        );
        if (offlineCredentials) {
          const dataToSend = {};
          dataToSend.email = obj.email;
          dataToSend.offlineToken = offlineCredentials.offlineToken;
          dataToSend.offlineKey = offlineCredentials.offlineKey;
          dataToSend.token = obj.token;
          dataToSend.project_id = obj.project_id;

          axios
            .post(`${this._options.baseHref}/syncro.login.php`, dataToSend)
            .then((response) => {
              if (response.data.status === "Accepted") {
                resolve(response.data.message);
              } else {
                reject(response.data.message);
              }
            })
            .catch((error) => {
              _logger.error(_self._fileName, "syncroLogin", error);
              reject(new Error(error));
            });
        } else {
          reject(new Error("no stored credentials login"));
        }
      } else {
        reject(new Error("no offline login"));
      }
    });
  }

  getCurrentToken(obj) {
    return new Promise((resolve, reject) => {
      if (navigator.onLine) {
        _logger.info(_self._fileName, "getCurrentToken online");
        axios
          .post(`${this._options.baseHref}/ajax.token.php`, {})
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            _logger.error(_self._fileName, "getCurrentToken", error);
            reject(new Error(error));
          });
      } else {
        var offlineCredentials = JSON.parse(
          localStorage.getItem(`offlineLogin_${obj.email}`)
        );
        _logger.info(
          _self._fileName,
          "getCurrentToken offline",
          offlineCredentials
        );
        if (offlineCredentials) {
          resolve(offlineCredentials.sessionToken);
        } else {
          reject(new Error("no offline login"));
        }
      }
    });
  }

  netwoorkStatusIndicator(mode) {
    if (
      document.getElementById("networkIndicatorOffline") &&
      document.getElementById("networkIndicatorOnline")
    ) {
      if (mode === "online") {
        document.getElementById("networkIndicatorOnline").style.display =
          "block";
        document.getElementById("networkIndicatorOffline").style.display =
          "none";
      } else {
        document.getElementById("networkIndicatorOnline").style.display =
          "none";
        document.getElementById("networkIndicatorOffline").style.display =
          "block";
      }
    }
  }
}

window.Login = Login;
