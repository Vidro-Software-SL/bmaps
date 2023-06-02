<?php

class ControllerIndex{
	private $_system;
	function __construct()
	{


		require_once 'libs/config.php';
		$this->_system 			= System::singleton();
		$check					= new Check(true);

		if($_SESSION['projects_number']===1){
			header('location:logout.php');
			exit;
		}
		$this->_hat 			= new Hat();
		$this->_shoe 			= new Shoe();

		$data["baseHref"]	= $this->_system->GetBaseRef();
		$data["skin"]			= $this->_system->get('skin');
		$data['env']			= $this->_system->getEnviroment();
		$data['token']		= $_SESSION['token'];		//token for cross site injection
    $project_id       = (empty($_GET['w']))       ? null     : $this->_system->nohacker($_GET['w']);
    $defaultTableLimit = (empty($this->_system->get('defaultTableLimit')))       ? 10     : $this->_system->get('defaultTableLimit');

		$data['logged']			= $_SESSION['logged'];
    $_SESSION['currentProject'] = $project_id;
    $data['project_id'] = $_SESSION['currentProject'];
		$data['user_id']		= $_SESSION['user_id'];
		$data['user_name']	= $_SESSION['user_id'];
		$data['user_email']	= $_SESSION['user_email'];
    $data['limit']	= $defaultTableLimit;
    $data['serverInstance'] = $this->_system->get('serverInstance');
		$page       			= (empty($_GET['page']))			? 1 			: $_GET['page'];
		$month       			= (empty($_GET['month'])) 		? null 		: $_GET['month'];

		$this->_hat->pintaHat();
		$this->_system->fShow($data["skin"]."/tpl_table.php",$data);
		$this->_shoe->pintaShoe();


	}


}

new ControllerIndex();

?>
