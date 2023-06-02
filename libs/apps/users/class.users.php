<?php

/***
	Class Users

	June 2018

 ***/
class Users
{
	protected $_system;

	public function __construct()
	{
		$this->_system = System::singleton();
	}


	public function login($email, $pwd, $offlineToken = null)
	{


		return array("status" => "Failed", "message" => "error ", "code" => 400);
	}

	private function _getCustomerSkin($skin)
	{

		return      $this->_checkIfSkinExists($skin);
	}

	protected function _checkIfSkinExists($skin)
	{
		if (file_exists($this->_system->get('path') . "tpl/" . $skin . "/tpl_project.php")) {
			return $skin;
		} else {
			return "default";
		}
	}

	protected function _updateLogin($user_id)
	{
		return array("status" => "Accepted", "message" => [], "count" => 0);
	}

	public function getUsersProjects($user_id)
	{
		return array("status" => "Accepted", "message" => [], "count" => 0);
	}

	public function getUsersProjectsPrivileges($user_id)
	{

		return array("status" => "Accepted", "message" => [], "count" => 0);
	}
	public function getUserCostumers($user_id)
	{

		return array("status" => "Failed", "message" => array());
	}

	public function checkUserCanAccessProject($user_id, $project_id)
	{
		return array("status" => "Failed");
	}

	protected function _encriptpwd($pwd)
	{
		return ($pwd);
	}

	protected function _encryptData($value, $key)
	{

		return;
	}

	protected function _decryptData($value, $key)
	{
		return;
	}

	protected function _generateLoginToken($user, $pwd, $user_id)
	{


		return array("offlineToken" => null, "offlineKey" => null);
	}
}
