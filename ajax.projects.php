<?php

class ControllerIndex{
	private $_system;
	private $_hat;
	private $_shoe;
	function __construct()
	{

		header('Content-Type: application/json');
		require_once 'libs/config.php'; //Archivo con configuraciones.
		//$check				= new Check();
		$this->_system = System::singleton();//contiene objeto system
		$_POST 		= json_decode(file_get_contents('php://input'), true);
		require_once 'libs/apps/projects/class.projects.php';
		$projects 	= new Projects();
		$what   	= (empty($_POST['what'])) 			? null 		: $_POST['what'];
		$token   	= (empty($_POST['token'])) 			? null 		: $_POST['token'];
    $_token = (isset($_SESSION['token'])) ? $_SESSION['token'] : null;
		if($token===$_token){
			if($what==="GET_PROJECT_INFO"){
				$project_id   = (empty($_POST['project_id'])) 			? null 	: $this->_system->nohacker($_POST['project_id']);
				if($project_id){
					$project 	= $projects->getProjectInfo($project_id);
					echo json_encode($project);
				}else{
					echo json_encode(array("status"=>"Failed","message"=>"No project_id"));
				}
			}else if($what==="GET_USER_PERMISSIONS"){
				$project_id   = (empty($_POST['project_id'])) 			? null 	: $this->_system->nohacker($_POST['project_id']);
				$permissions 	= $projects->getUserProjectPermissions($project_id,$_SESSION['user_id']);
				echo json_encode($permissions);
			}else if($what==="GET_FORM_DATA"){
    			$form_data = $projects->getFormData();
    			echo json_encode($form_data);
			}else if($what==="GET_BACKGROUNDS"){
				$project_id   = (empty($_POST['project_id'])) 			? null 	: $this->_system->nohacker($_POST['project_id']);
				$form_data = $projects->getProjectBackgrounds($project_id);
				echo json_encode($form_data);
			}else if($what==="GET_TILED"){
				$project_id   = (empty($_POST['project_id'])) 			? null 	: $this->_system->nohacker($_POST['project_id']);
				$form_data = $projects->getProjectTiled($project_id);
				echo json_encode($form_data);
			}else if($what==="GET_TILED_INFO"){
				$tiled_id   = (empty($_POST['tiled_id'])) 			? null 	: $this->_system->nohacker($_POST['tiled_id']);
				$form_data = $projects->getTiledInfo($tiled_id);
				echo json_encode($form_data);
			}
		}else{
			echo json_encode(array("status"=>"Failed","message"=>"Cross site injection detected"));
		}
	}
}

new ControllerIndex();
