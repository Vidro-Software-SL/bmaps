# BMAPS #

## JS main library for Bmaps 

Based on `angularjs/1.4.8`

### Structure ###

> app.js, mapFactory.js

Main files

>fileReader.js && fileUpload.js

Helpers for uploading files

>loggerService.js

Log functions

>mapAddTool.js


>mapAjaxOperations.js,



>mapMeasureTool.js,


>mapOffline.js,


>mapPhotos.js,


>mapSelectTool.js

Select tools


>mapStorage.js



>mapToc.js

TOC functions

>socketFactory.js

Realtime functions... maybe can be removed, there's a library `realtime` with similar o same functions.

>directives/feauturesDirectives.js

>/../../js/directives/toolsDirectives.js

### Build ###

There's a *Gulp* builder in `bmaps/tpl/default/js/src/gulpfile.js`

**a.** Update version number in `bmaps/tpl/default/js/src/package.json`:

```
"versions": {
    "bmaps": "x.x.x"
  }

```

**b.** Run gulp task `buildBmaps`

**e.g:**

```
cd bmaps/tpl/default/js/src
gulp buildBmaps
```


### old builder ###

In case of problems with gulp builder, create an .sh file inside `js/bmaps/` with this content

```
echo "Build Bmaps"
echo "2.2.0"
cat app.js fileReader.js fileUpload.js loggerService.js mapAddTool.js mapAjaxOperations.js  mapFactory.js mapMeasureTool.js mapOffline.js mapPhotos.js mapSelectTool.js mapStorage.js mapToc.js socketFactory.js directives/feauturesDirectives.js ../directives/toolsDirectives.js > bmaps.2.2.0.js
ngmin bmaps.2.2.0.js bmaps.2.2.0.min.js
uglifyjs bmaps.2.2.0.min.js --output ../dist/bmaps.2.2.0.min.js
rm bmaps.2.2.0.js
rm bmaps.2.2.0.min.js
```