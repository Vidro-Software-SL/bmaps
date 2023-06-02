<?php
class ControllerIndex{
	private $_system;
	function __construct()
	{
		require_once 'libs/config.php';
		$this->_system 					= System::singleton();
    $data["autologin"] = 0;
		$data["autologinUser"] = null;
		$data["autologinPassword"] = null;
		if($this->_system->get('autologin') && !isset($_GET['e'])){
      $data["autologinUser"] = $this->_system->get('autologinUser');
      $data["autologinPassword"] = $this->_system->get('autologinPassword');
      $data["autologin"] = 1;
		}

		$this->_hat 						= new Hat();
		$this->_shoe 						= new Shoe();
		$data["baseHref"]				= $this->_system->GetBaseRef();
		$data["skin"]						= $this->_system->get('skin');
		$json_file 							= "tpl/".$this->_system->get('skin')."/texts.json";
		if(file_exists($json_file)){
			$strJsonFileContents = file_get_contents($json_file);
			$array = json_decode($strJsonFileContents, true);
			$data["slogan1"]				= $array['slogan1'];
			$data["slogan2"]				= $array['slogan2'];
		}else{
			$data["slogan1"]				= "Default slogan1";
			$data["slogan2"]				= "Default slogan2";;
		}
		$data['env']						= $this->_system->getEnviroment();
		$data['token']					= session_id();		//token for cross site injection
		$_SESSION['logged']			= false;
    $data['offlineLogin']   = $this->_system->get('offlineLogin');
    $data['serverInstance'] = $this->_system->get('serverInstance');
		$this->_system->fShow($this->_system->get('skin')."/tpl_login.php",$data);
	}
}
new ControllerIndex();
