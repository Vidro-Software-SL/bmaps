<?php

class ControllerIndex
{
	private $_system;
	function __construct()
	{


		require_once 'libs/config.php';
		$this->_system 			= System::singleton();
		$check					= new Check(true);

		$this->_hat 			= new Hat();
		$this->_shoe 			= new Shoe();

		$data["baseHref"]	= $this->_system->GetBaseRef();
		$data["skin"]			= $this->_system->get('skin');
		$data['env']			= $this->_system->getEnviroment();
		$data['token']		= $_SESSION['token'];		//token for cross site injection

		$data['logged']			= $_SESSION['logged'];
		$data['canAccessFiles'] = false;

		$data['user_id']		= $_SESSION['user_id'];
		$data['user_name']	= $_SESSION['user_id'];
		$data['user_email']	= $_SESSION['user_email'];

		$data['serverInstance'] = $this->_system->get('serverInstance');
		$page       			= (empty($_GET['page']))			? 1 			: $_GET['page'];
		$month       			= (empty($_GET['month'])) 			? null 			: $_GET['month'];
		$data['device'] = 0;
		$detect = new Mobile_Detect();
		if ($detect->isMobile()) {
			$data['device']    = 1;
		} else if ($detect->isTablet()) {
			$data['device']    = 2;
		}
		if ($this->_system->get('offlineLogin')) {
			$data['useOffline'] = true;
			$data['offlineStoreName']	= $this->_system->get('offlineStoreName');
			$data['offlineCacheVersion'] = $this->_system->get('offlineCacheVersion');
			$data['offlineLocalForageVersion'] = $this->_system->get('offlineLocalForageVersion');
		} else {
			$data['useOffline'] = false;
			$data['offlineStoreName']	= null;
			$data['offlineCacheVersion'] = null;
			$data['offlineLocalForageVersion'] = null;
		}
		$this->_hat->pintaHat();
		$this->_system->fShow($data["skin"] . "/tpl_home.php", $data);
		$this->_shoe->pintaShoe();
	}
}

new ControllerIndex();
