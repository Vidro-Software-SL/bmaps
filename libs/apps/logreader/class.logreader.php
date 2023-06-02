<?php
class LogReader
{
	private $_system;
	function __construct()
	{
		require_once 'libs/config.php'; //Archivo con configuraciones.
		$this->_system = System::singleton(); //contiene objeto system
	}

	public function listaCollections($type)
	{
	}


	public function readActivityLog($offset, $limit, $user, $month = null)
	{

		return array("status" => "Failed", "message" => "error", "results" => array(), "total" => 0);
	}



	public function readBackofficeLog($offset, $limit, $month = null, $user = null, $ip = null, $msg = null)
	{

		return array("status" => "Failed", "message" => "error");
	}

	public function readOneLog($id, $col)
	{

		return array("results" => []);
	}
}
