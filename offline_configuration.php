<?php

class ControllerIndex{
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
		$data['user_id']		= $_SESSION['user_id'];
		$data['user_name']	= $_SESSION['user_id'];
		$data['user_email']	= $_SESSION['user_email'];
		if($this->_system->get('offlineLogin')){
		  $data['offlineLogin'] = true;
      $data['offlineStoreName']	= $this->_system->get('offlineStoreName');
      $data['offlineCacheVersion'] = $this->_system->get('offlineCacheVersion');
      $data['offlineLocalForageVersion'] = $this->_system->get('offlineLocalForageVersion');
		}else{
			$data['offlineLogin'] = false;
      $data['offlineStoreName']	= null;
      $data['offlineCacheVersion'] = null;
      $data['offlineLocalForageVersion'] = null;
		}

    $data['serverInstance'] = $this->_system->get('serverInstance');
		$this->_hat->pintaHat();
		$this->_system->fShow($data["skin"]."/tpl_offline_configuration.php",$data);
		$this->_shoe->pintaShoe();


	}


}

new ControllerIndex();

?>
