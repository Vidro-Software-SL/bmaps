<?php

class ControllerIndex{
	private $_system;
	private $_hat;
	private $_shoe;
	function __construct()
	{

		header('Content-Type: application/json');
		require_once 'libs/config.php'; //Archivo con configuraciones.
		$check				  = new Check();
		$this->_system = System::singleton();//contiene objeto system
$_POST 								= json_decode(file_get_contents('php://input'), true);
		$token   		= (empty($_POST['token'])) 			? null 		: $_POST['token'];
		$constants 	= get_defined_constants(true);
		$return 		= array();
		$excludeKey	= array(
									
										"TRANSLATION_CONFIG_LANGUAGE",
										"TRANSLATION-CONFIG_GENERATED"
		);

		if($token===$_SESSION['token']){
      if(is_array($constants['user'])){
			     if(count($constants['user'])>0){
				      foreach ($constants['user'] as $key => $value) {
    					if(!in_array($key,$excludeKey)){
    						array_push($return,array($key=>$value));
    					}
    				}
				  echo json_encode(array("status"=>"Accepted","message"=>$return,"code"=>200));
        }else{
          echo json_encode(array("status"=>"Failed","message"=>"No strings found for ".$_SESSION['lang'],"code"=>404));
        }
			}else{
				echo json_encode(array("status"=>"Failed","message"=>"No strings found for ".$_SESSION['lang'],"code"=>404));
			}
		}else{
			echo json_encode(array("status"=>"Failed","message"=>"Cross site injection detected","code"=>403));
		}
	}
}

new ControllerIndex();
