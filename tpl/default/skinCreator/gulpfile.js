'use strict';
const { src, dest,series } = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const minCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const log = require('fancy-log');
const colors = require('colors');
const minimist = require('minimist');
const jsonModify = require('gulp-json-modify');
const fs = require('fs');
var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};
var json = JSON.parse(fs.readFileSync('./package.json'));
let skins = json.skins.list;

/*
    copyCssMasters

    Copies css/masters/*.scss to a temporal folder
    Copies skin _colors file to same temporale folder

 */
function copyCssMasters(){

  for(let i=0;i<skins.length;i++){
    console.log("copyCssMasters "+skins[i]);
    let ope = src(['../css/master/*.scss','../../'+skins[i]+'/css/master/_colors.scss'])
              .pipe(dest('tempCSS/'+skins[i]));
    //notify when finished
    if(i===skins.length-1){
        console.log("copyCssMasters finished");
        return ope;
    }
  }
}

/*
    compileCss

    compiles sass

 */
function compileCss(){

    for(let i=0;i<skins.length;i++){
        console.log("compileCss "+skins[i]+"");
        let ope =src(['tempCSS/'+skins[i]+'/style.scss','tempCSS/'+skins[i]+'/style-login.scss','tempCSS/'+skins[i]+'/home.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({keepSpecialComments: 1, processImport: false}).on('error', sass.logError))
        .pipe(sourcemaps.write(''))
        .pipe(minCss({keepSpecialComments: 1, processImport: false}))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(dest('../../'+skins[i]+'/css/dist'));
        if(i===skins.length-1){
            console.log("compileCss finished");
            return ope;
        }
    }
}
/*

    cleans temporal files
 */
function cleanTempFiles(){
    console.log("cleanTempFiles");
    return src('tempCSS',{read: false,allowEmpty:true})
        .pipe(clean());
}

function updatePackage(skin){
  console.log("updatePackage",skin);
  console.log(skin)
  //add skin name to package.json skins
  json.skins.list.push(skin);
  return src([ './package.json' ])
   .pipe(jsonModify({
     key: 'skins',
     value: json.skins
   }))
   .pipe(dest('./'));
}

function createSkin(){
    var options = minimist(process.argv.slice(2), knownOptions);
    if(typeof options.skin!='undefined'){
      if(!(options.skin in json.skins)){
        //create skin duplicating sewernet skin
        let create =  src(['../../sewernet/**/*'])
            .pipe(dest('../../'+options.skin))
            //update package.json
        return    updatePackage(options.skin)

      }else{
        log(colors.red("\n\nSkin "+options.skin+" already exists!\n"));
        return Promise.resolve('Error');
      }
    }else{
      log(colors.red("\n\nYou must set an skin name: --skin skinName\n"));
      return Promise.resolve('Error');
    }
}

exports.createSkin = createSkin;
exports.compileCss = series(copyCssMasters,compileCss,cleanTempFiles)
