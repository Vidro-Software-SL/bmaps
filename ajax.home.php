<?php

class ControllerIndex{
	private $_system;
	private $_hat;
	private $_shoe;
	function __construct()
	{

		header('Content-Type: application/json');
		require_once 'libs/config.php'; //Archivo con configuraciones.
		$check								= new Check();
		$this->_system 				= System::singleton();//contiene objeto system
		$_POST 								= json_decode(file_get_contents('php://input'), true);
		$what   							= (empty($_POST['what'])) 									? null 			: $_POST['what'];
		$token   							= (empty($_POST['token'])) 									? null 			: $_POST['token'];
		unset($_POST['what']);
		unset($_POST['token']);
		if(isset($_SESSION['token'])){
			if($token===$_SESSION['token']){
				if($what==="GET_USER_PROJECTS"){
	        echo json_encode(array("status"=>"Accepted","message"=>$_SESSION['user_projects'],"code"=>200));
	      }
			}else{
				echo json_encode(array("status"=>"Failed","message"=>"Cross site injection detected"));
			}
		}else{
			echo json_encode(array("status"=>"Failed","message"=>"no session"));
		}
	}
}

new ControllerIndex();
