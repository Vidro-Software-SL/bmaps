<?php

class Shoe{
	private $_system;
	function __construct(){
		$this->_system = System::singleton();//contiene objeto system
   	}

	public function pintaShoe(){
		$data["baseHref"]	= $this->_system->GetBaseRef();
		$data["skin"]			= $this->_system->get('skin');
		$data["env"]			= $this->_system->getEnviroment();

		$this->_system->fShow($data["skin"]."/tpl_footer.php",$data);
	}
}
