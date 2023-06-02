<?php

class ControllerIndex{
	private $_system;
	function __construct()
	{

		require_once 'libs/config.php'; //Archivo con configuraciones.
		$this->_system = System::singleton();//contiene objeto system

		header('location:index.php?e='.$_GET['e']);
	}

}

new ControllerIndex();
?>
