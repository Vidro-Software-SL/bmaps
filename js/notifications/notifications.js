/* jshint esversion: 6 */
import { EventEmitter } from "events";
import axios from "axios";
import RichLogger from "../src/richLogger";
import { version } from "./package";
import Point from "ol/geom/Point";
import { toLonLat } from "ol/proj";

import { register } from "ol/proj/proj4";
let _self = null,
  _events = null,
  _options = null,
  _roles = [],
  _users = [],
  _selectedUser = null,
  _selectedRole = null,
  _logger = null;

export default class Notifications extends EventEmitter {
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
    _self = this;
    _events = EventEmitter;
    _self._fileName = "notifications.js";
    _options = options;
    _logger = new RichLogger(options.env, {});
    _logger.info(_self._fileName, `Module loaded v.${version}`, options);
  }

  getNotificationForm() {
    _logger.info(_self._fileName, "getNotificationForm()");
    return _self.getRoles();
  }

  //****************************************************************
  //************             NOTIFICATION          *****************
  //****************************************************************

  buildNotification(subject, data, coordinates, epsg, table, pol_id, id_name) {
    return new Promise((resolve, reject) => {
      _logger.info(_self._fileName, "buildNotification", {
        subject: subject,
        data: data,
        coordinates: coordinates,
        epsg: epsg,
        table: table,
        id_name: id_name,
        pol_id: pol_id,
      });
      let user = _self.getUser(_selectedUser);
      if (user) {
        let gm_link = _self._generateLinkToGoogleMaps(coordinates, epsg);
        let body = `${_options.strings.NOTIFY}\r\n\r\n`;
        body += `Google Maps: ${gm_link}\r\n`;
        if (table != null) {
          let bmapsLink = _self._generateLinkToBmaps(table, pol_id, id_name);
          body += `Bmaps: ${bmapsLink}\r\n`;
        }
        body += `\r\n\r\n`;
        if (data) {
          for (let i = 0; i < data.length; i++) {
            if (
              data[i].label != "the_geom" &&
              data[i].label != "geom" &&
              data[i].type != "button"
            ) {
              if (data[i].type === "combo") {
                body += _self._getComboValue(data[i]);
              } else {
                if (typeof data[i].value != "undefined")
                  body += `${data[i].label}: ${data[i].value}\r\n`;
              }
            }
          }
        }
        body = encodeURIComponent(body);
        window.open(`mailto:${user.email}?subject=${subject}&body=${body}`);
        resolve();
      } else {
        reject("no user");
      }
    });
  }

  _getComboValue(data) {
    _logger.info(_self._fileName, "_getComboValue", { data: data });
    for (let i = 0; i < data.comboValues.length; i++) {
      if (data.comboValues[i].id === data.selectedId) {
        return `${data.label} ${data.comboValues[i].name}\r\n`;
      }
    }
  }

  _generateLinkToGoogleMaps(coordinates, epsg) {
    _logger.info(_self._fileName, "_generateLinkToGoogleMaps", {
      coordinates: coordinates,
      epsg: epsg,
    });
    proj4.defs(
      "EPSG:25831",
      "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    );
    register(proj4);
    let pt = new Point(coordinates);
    pt.transform(epsg, "EPSG:4326");
    let longLat = toLonLat(
      [pt.getCoordinates()[1], pt.getCoordinates()[0]],
      "EPSG:4326"
    );
    return `https://maps.google.com/?q=${longLat[0]},${longLat[1]}`;
  }

  _generateLinkToBmaps(table, pol_id, id_name) {
    _logger.info(_self._fileName, "_generateLinkToBmaps", {
      table: table,
      pol_id: pol_id,
      id_name: id_name,
    });
    return `${_options.baseHref}project.php?w=${_options.project_id}&table=${table}&id_name=${id_name}&pol_id=${pol_id}`;
  }

  //****************************************************************
  //************           END NOTIFICATION        *****************
  //****************************************************************

  //****************************************************************
  //************                HELPERS            *****************
  //****************************************************************

  buildForm(fields) {
    _logger.info(_self._fileName, "buildForm", { fields: fields });
    let _formTabs = [
      {
        buttons: [
          {
            buttonAction: "notifyAction",
            disabled: false,
            label: _options.strings.NOTIFY,
            name: "notifyButton",
            type: "button",
            //  position: 'footer',
          },
          {
            buttonAction: "backButtonClicked",
            disabled: false,
            label: _options.strings.BACK,
            name: "backbutton",
            type: "button",
            //position: 'footer',
          },
        ],
        active: true,
        fields: fields,
        tabIdName: "Noti",
        tabLabel: _options.strings.VIEW_USERS_NOTICATIONS,
        tabName: _options.strings.VIEW_USERS_NOTICATIONS,
      },
    ];
    let form = {
      formInfo: {},
      formName: _options.strings.VIEW_USERS_NOTICATIONS,
      formTabs: _formTabs,
      formId: "notifications_form",
      activeTab: _formTabs[0],
    };
    return form;
  }

  createCombo(object, comboOptions) {
    _logger.info(_self._fileName, "createCombo", { data: object });
    let comboIds = [];
    let comboNames = [];
    let comboValues = object;
    for (let i = 0; i < object.length; i++) {
      comboIds.push(object[i].id);
      comboNames.push(object[i].name);
    }
    let combo = {
      comboIds: comboIds,
      comboNames: comboNames,
      comboValues: comboValues,
      length: comboOptions.length,
      dataType: "string",
      disabled: comboOptions.disabled,
      label: comboOptions.label,
      name: comboOptions.name,
      widgetAction: comboOptions.widgetAction,
      placeholder: "",
      selectedId: comboOptions.selectedId,
      type: "combo",
    };
    return combo;
  }

  //****************************************************************
  //************            END HELPERS            *****************
  //****************************************************************
}
window.Notifications = Notifications;
