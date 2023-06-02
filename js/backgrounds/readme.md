# BMAPS Backgrounds library #

Handles BMAPS backgrounds

#### Install #### 

`npm install`

#### Develop ####

Add/edit/remove a background to `bg.js` inside the method `getBackground`.

Run `npm run watch`, this comand will generate `js/dist/bgBundle.js` everytime you change `bg.js` 

Or Run `npm run build`, this comand will generate `js/dist/bgBundle.js`


#### Distribute ####

 Run `npm run dist`, this comand will generate `js/dist/bgBundle.x.x.x.min.js`
 
 This will be a minified and versioned js library. Version number will be taken from from `package.json`
 
#### Examples ####

```
$>cd bmaps/js/backgrounds
$>npm install
$>npm run watch
$>npm run build
$>npm run dist
```
