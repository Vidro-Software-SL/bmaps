"use strict";
const { src, dest, series } = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const clean = require("gulp-clean");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const log = require("fancy-log");
const colors = require("colors");
const minimist = require("minimist");
var ngmin = require("gulp-ngmin");
const fs = require("fs");
var knownOptions = {
  string: "env",
  default: { env: process.env.NODE_ENV || "production" },
};
var json = JSON.parse(fs.readFileSync("./package.json"));

function compileOffline() {
  return src("ui.offline.js")
    .pipe(concat("ui.offline." + json.versions.uiHome + ".min.js"))
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(uglify())

    .pipe(dest("../dist/"));
}

function compileFiles() {
  return src("ui.files.js")
    .pipe(concat("ui.files." + json.versions.uiFiles + ".min.js"))
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(uglify())

    .pipe(dest("../dist/"));
}
function compileHome() {
  return src("ui.home.js")
    .pipe(concat("ui.home." + json.versions.uiHome + ".min.js"))
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(uglify())

    .pipe(dest("../dist/"));
}
function compileTable() {
  return src("ui.table.js")
    .pipe(concat("ui.table." + json.versions.uiTable + ".min.js"))
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(uglify())

    .pipe(dest("../dist/"));
}
function minifyAngular() {
  return src([
    "controller.offline.js",
    "controller.photos.js",
    "controller.table.js",
    "controller.visits.js",
    "controller.filters.js",
    "controller.autologout.js",
    "controller.notifications.js",
    "controller.AccessControl.js",
    "controller.multiupdate.js",
    "controller.js",
    "controller.flowtrace.js",
  ])
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(ngmin())
    .pipe(concat("controller.min.js"))
    .pipe(dest("./"));
}
function minifyInterface() {
  return src("interface.js")
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(uglify())
    .pipe(concat("interface.min.js"))
    .pipe(dest("./"));
}
function compileMaps() {
  return src(["controller.min.js", "interface.min.js"])
    .pipe(concat("uiMaps." + json.versions.uiMaps + ".min.js"))
    .pipe(dest("../dist/"));
}

function cleanTempFiles() {
  console.log("cleanTempFiles");
  return src(["controller.min.js", "interface.min.js"], {
    read: false,
    allowEmpty: true,
  }).pipe(clean());
}

function buildBmaps() {
  let baseDir = "../../../../js/bmaps/";
  let filesToConcat = [
    `${baseDir}app.js`,
    `${baseDir}fileReader.js`,
    `${baseDir}fileUpload.js`,
    `${baseDir}loggerService.js`,
    `${baseDir}mapAddTool.js`,
    `${baseDir}mapAjaxOperations.js`,
    `${baseDir}mapFactory.js`,
    `${baseDir}mapMeasureTool.js`,
    `${baseDir}mapOffline.js`,
    `${baseDir}mapPhotos.js`,
    `${baseDir}mapSelectTool.js`,
    `${baseDir}mapStorage.js`,
    `${baseDir}mapToc.js`,
    `${baseDir}socketFactory.js`,
    `${baseDir}directives/feauturesDirectives.js`,
    `../../../../js/directives/toolsDirectives.js`,
  ];
  let target = `../../../../js/dist/bmaps.${json.versions.bmaps}.min.js`;
  return src(filesToConcat)
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(ngmin())
    .pipe(
      uglify({
        mangle: false,
      })
    )
    .pipe(concat(target))
    .pipe(dest("../dist/"));
}
exports.compileFiles = compileFiles;
exports.buildBmaps = buildBmaps;
exports.compileMaps = compileMaps;
exports.compileHome = compileHome;
exports.compileTable = compileTable;
exports.compileOffline = compileOffline;
exports.minifyAngular = minifyAngular;
exports.compileUI = series(
  minifyAngular,
  minifyInterface,
  compileMaps,
  cleanTempFiles
);
