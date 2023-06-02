<?php

class ControllerIndex{
	private $_system;
	private $_hat;
	private $_shoe;
	function __construct()
	{

		header('Content-Type: application/json');
		require_once 'libs/config.php'; //Archivo con configuraciones.
		//$check								= new Check();
		$this->_system 				= System::singleton();//contiene objeto system
		$_POST 								= json_decode(file_get_contents('php://input'), true);
		require_once 'libs/apps/projects/class.table.php';
		$table 						= new Table();
		$what   							= (empty($_POST['what'])) 									? null 			: $_POST['what'];
		$token   							= (empty($_POST['token'])) 									? null 			: $_POST['token'];
		$layer   							= (empty($_POST['layer'])) 									? null 			: $_POST['layer'];
		$db_table 						= (empty($_POST['db_table'])) 							? null 			: $_POST['db_table'];
		$device   						= (empty($_POST['device'])) 								? null 			: $_POST['device'];
		$pol_id  							= (empty($_POST['pol_id'])) 								? null 			: $_POST['pol_id'];
		$offset  							= (empty($_POST['offset'])) 								? 0 			: $_POST['offset'];
    $defaultTableLimit = (empty($this->_system->get('defaultTableLimit')))       ? 10     : $this->_system->get('defaultTableLimit');
		$limit  							= (empty($_POST['limit'])) 								  ? $defaultTableLimit 			: $_POST['limit'];
		$id_name = (empty($_POST['id_name'])) 								? null 			: $_POST['id_name'];
    $project_id = (empty($_POST['project_id'])) 					? null 			: $_POST['project_id'];
		$expected_api_version = (empty($_POST['expected_api_version'])) 	? "0.9.101" : $_POST['expected_api_version'];
		$_SESSION['expected_api_version'] = $expected_api_version;
		unset($_POST['layer']);
		unset($_POST['db_table']);
		unset($_POST['expected_api_version']);
		unset($_POST['pol_id']);
		unset($_POST['id_name']);
		unset($_POST['what']);
		unset($_POST['device']);
		unset($_POST['token']);

		if($token===$_SESSION['token']){
			if($what==="GET_TABLE"){
        $field  							= (empty($_POST['field'])) 				? null 			: $_POST['field'];
        $value  							= (empty($_POST['value'])) 				? null 			: $_POST['value'];
        $order  							= (empty($_POST['order'])) 				? null 			: $_POST['order'];
				$sort  								= (empty($_POST['sort'])) 				? null 			: $_POST['sort'];
				$res = $table->getTable($project_id,$db_table,$offset,$limit,$field,$value,$order,$sort,$expected_api_version);
				echo json_encode($res);
  		}
		}else{
			echo json_encode(array("status"=>"Failed","message"=>"Cross site injection detected"));
		}
	}
}

new ControllerIndex();

?>
