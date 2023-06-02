<?php
if(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off"){
		$redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		header('HTTP/1.1 301 Moved Permanently');
		header('Location: ' . $redirect);
		exit();
}
$url	= explode(".", $_SERVER['HTTP_HOST']);

require_once('utils/class.System.php');

$config = System::singleton();
$config->set('carpetaTpl', 'tpl/');									//carpeta de las plantillas
$config->set('carpetaLogs', 'logs/');								//carpeta de los logs
$config->set('carpetaIncludes', 'includes/');						//carpeta de los includes
$config->set('basedirContenidos','contenidos/');					//carpeta para los contenidos generados por los usuarios
$config->set('skin','default');										//carpeta tpl que usa el proyecto
$config->set('defaultLimit',10);
$config->set('path','/var/www/html/bmaps/');
//internal qgis url's
$config->set('qgis_url','https://yourqgisurl');
$config->set('qgis_wmts_url', 'http://yourqgisurl/wmts?');
$config->set('urlCustomBackground', 'http://yourqgisurlwmts?');

$config->set('_servidor_bd1', 'localhost');							//url mysql del servidor 1
$config->set('_database_bd1', 'db');								//bd del servidor 1
$config->set('_user_bd1', '');										//user mysql del servidor 1
$config->set('_password_bd1', '');									//passw del servidor 1

$config->set('_servidor_bd2', 'localhost');							//url mysql del servidor 2
$config->set('_database_bd2', 'no');								//bd del servidor 2
$config->set('_user_bd2', '');										//user mysql del servidor 2
$config->set('_password_bd2', '');								//passw del servidor 1


$config->set('urlSocket', 'https://yoururl');



$config->set('skin','default');
$config->SetbaseRef('https://yoururl');
$config->set('urlWMS','yoururl');
$config->set('urlWMTS', 'hyoururl');

//use offline login
$config->set('offlineLogin',false);
//server instance name - used for offline login
$config->set('serverInstance','xxxxx');

//	Language
$config->set('langs', array('es','en','ca'));
if (isset($_GET['lang']) && !empty($_GET['lang'])){
	if (in_array($_GET['lang'], $config->get('langs'))){
		$_SESSION['lang'] = $_GET['lang'];
	}
}
else if (!isset($_SESSION['lang'])){

	$_SESSION['lang'] = "en";
}



$config->loadConstantsCommon($_SESSION['lang']);


$config->set('environment','prod');
