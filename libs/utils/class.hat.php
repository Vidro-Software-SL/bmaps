<?php
class Hat{
	private $_ruta;
	private $_system;
	private $_detect;
	function __construct(){
		$this->_system 		= System::singleton();
		$this->_detect = new Mobile_Detect();
	}

	public function pintaHat($section=null){
		$data["baseHref"]		= $this->_system->GetBaseRef();
		$data["skin"]				= $this->_system->get('skin');
		$data["env"]				= $this->_system->getEnviroment();
		$data["lang"]				= $_SESSION['lang'];
		$data['isMobile']		= $this->_detect->isMobile();
		$data['section']		= $section;
		$data['logoHeader']	= $this->_system->get('logo_home');
		$data['logged']			= $_SESSION['logged'];
		$json_file 					= $this->_system->get('path')."tpl/".$this->_system->get('skin')."/texts.json";
		if(file_exists($json_file)){
			$strJsonFileContents = file_get_contents($json_file);
			$array = json_decode($strJsonFileContents, true);
			$data["slogan1"]				= $array['slogan1'];
			$data["slogan2"]				= $array['slogan2'];
		}else{
			$data["slogan1"]				= "Default slogan1";
			$data["slogan2"]				= "Default slogan2";;
		}
    if($this->_system->get('offlineLogin')){
        $data['offlineLogin'] = true;
    }else{
        $data['offlineLogin'] = false;
    }
		$this->_system->fShow($data["skin"]."/tpl_header.php",$data);
	}
}
?>
