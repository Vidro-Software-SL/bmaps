<?php

class Visor
{
	private $_system;
	function __construct()
	{
		$this->_system = System::singleton();
	}
	public function fShow($name, $vars = array())
	{

		$path = $this->_system->get('carpetaTpl') . $name;

		if (file_exists($path) == false) {
			$this->_system->imprError(trigger_error('Template `' . $path . '` no existe.', E_USER_NOTICE));
			return false;
		}


		if (is_array($vars)) {
			foreach ($vars as $key => $value) {
				$$key = $value;
			}
		}


		include($path);
	}
}
