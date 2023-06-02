# **BMAPS 2.0**

**BMAPS 2.0 is deprecated.**

BMAPS 3.0 is under development and will be published once is finished.

## **System requirements **

- Apache
- Postgres
- PHP 7.x
- QGIS server

**BMAPS** is structured as a multiskin site.
Each project can have a custom skin, assigned on the backoffice.
There's a _default_ skin that would be automatically assigned to projects.
Available skins are inside _tpl_ folder.

**Installation check**
Run `check.php` for installation analysis

## **Configuration**

Duplicate `libs/config_demo.php` and rename as `libs/config.php`

Default skin

> $config->set('skin','default');

Path to system folder where is hosted **BMAPS**

> $config->set('path','/var/www/html/bmaps/');

In case there're paginated lists on the site, default limit per page

> $config->set('defaultLimit',10);

**BMAPS** base url

> $config->SetbaseRef('https://yoururl/');

**Backoffice's postgres db configuration**

> $config->set('_servidor_bd1', 'localhost');
>$config->set('\_database_bd1', 'dbName');
> $config->set('_user_bd1', 'dbUserName');
>$config->set('\_password_bd1', 'dbPassword');

**Server cores for WMS**
number of cores you want to use for wms

> $config->set('serverCores',4);

**QGIS** internal webserver url (used by proxy)

> $config->set('qgis_url','https://yourqgis');

**QGIS WTMS** internal webserver url (used by proxy)

> config->set('qgis_wmts_url','yourqgiswmts');

**WMS** url

> $config->set('urlWMS','h yourqgis');

**WMTS** url
$config->set('urlWMTS','yourqgis');

In case of websocket funcionality, ws url

> $config->set('urlSocket','https://yoursocket');
> **Autologin**

If a customer **_doesn't want to use the login form_** and has a common username and password for all users, set `autologin=>true` and fill the autologinUser and autologinPassword parameters with the right values.

> $config->set('autologin',false); //flag for activate/deactivate autologin

> $config->set('autologinUser','valid user name');

> $config->set('autologinPassword','valid password for user');

**Offline login**

If bmaps instance can use offline

> $config->set('offlineLogin',true);

> $config->set('offlineStoreName','bmaps_default');

> $config->set('offlineCacheVersion','bmaps-0.0.2');

> $config->set('offlineLocalForageVersion','2.0');

**Print**

Print will download a pdf file, you can override this behaviour with this flag

Show PDF on a new browser tab

> $config->set('print_show_on_screen',1);

**Attributes table**

Set default limit for queries

> $config->set('defaultTableLimit',25);

## Languages

There's a google drive file with all translations.
Define the available languages in this array: array('es','en','ca'),
and default language under de comment `//Default language`

- es-> spanish
- ca-> catalan
- en-> english

```
$config->set('langs', array('es','en','ca'));
if (isset($_GET['lang']) && !empty($_GET['lang'])){
	if (in_array($_GET['lang'], $config->get('langs'))){
		$_SESSION['lang'] = $_GET['lang'];
	}
}else if (!isset($_SESSION['lang'])){
	//Default language
	$_SESSION['lang'] = "en";
}
```
