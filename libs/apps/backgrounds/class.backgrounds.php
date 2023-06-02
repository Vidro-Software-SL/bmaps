<?php

/***
	Class Backgrounds


	October 2018

 ***/
class Backgrounds
{
	protected $_system;

	public function __construct()
	{
		$this->_system = System::singleton();
	}


	public function getBackgroundData($bg_id)
	{
		$query 	= "SELECT * FROM backgrounds WHERE id='" . $bg_id . "'";
		$rs 		= $this->_system->pdo_select("bd1", $query);
		if (count($rs) === 1) {
			$retorno = array(
				'sys_id'  			=> $rs[0]['sys_id'],
				'id'  					=> $rs[0]['id'],
				'name'					=> $rs[0]['name'],
				'layer'					=> $rs[0]['layer'],
				'matrixSet'			=> $rs[0]['matrixset'],
				'service_uri'   => $rs[0]['service_uri']
			);

			return array("status" => "Accepted", "message" => $retorno);
		} else {
			return array("status" => "Failed");
		}
	}
}
