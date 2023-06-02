<?php

class ControllerIndex{
	private $_system;

	function __construct()
	{

		require_once 'libs/config.php';
		$check					= new Check();
		$this->_system 	= System::singleton();
		$project_name   = (empty($_POST['project_name'])) 			? null 		: $_POST['project_name'];
		$project_name		= $project_name."_";
		$what   				= (empty($_POST['what'])) 							? null 		: $_POST['what'];
		$retorno 				= array();

		if($what==="GENERATE_GEOJSON"){
			require_once 'libs/apps/projects/class.offline.php';
			$_off				= new Offline();
			$extent_0   = (empty($_POST['extent_0'])) 							? null 		: $_POST['extent_0'];
			$extent_1  	= (empty($_POST['extent_1'])) 							? null 		: $_POST['extent_1'];
			$extent_2		= (empty($_POST['extent_2'])) 							? null 		: $_POST['extent_2'];
			$extent_3		= (empty($_POST['extent_3'])) 							? null 		: $_POST['extent_3'];
			$userName		= (empty($_POST['userName'])) 							? null 		: $_POST['userName'];
      $filters		= (empty($_POST['filters'])) 							? null 		: $_POST['filters'];
      $availableFilterForLayers = (empty($_POST['availableFilterForLayers'])) ? null : $_POST['availableFilterForLayers'];

			$req 				= $_off->generateGeoJSON($extent_0,$extent_1,$extent_2,$extent_3,$userName,$filters,$availableFilterForLayers);
			echo json_encode($req);
		}else if($what==="REMOVE_GENERATED_GEOJSON"){
			require_once 'libs/apps/projects/class.offline.php';
			$_off				= new Offline();
			$extent_0   = (empty($_POST['extent_0'])) 							? null 		: $_POST['extent_0'];
			$extent_1  	= (empty($_POST['extent_1'])) 							? null 		: $_POST['extent_1'];
			$extent_2		= (empty($_POST['extent_2'])) 							? null 		: $_POST['extent_2'];
			$extent_3		= (empty($_POST['extent_3'])) 							? null 		: $_POST['extent_3'];
			$hash				= (empty($_POST['hash'])) 									? null 		: $_POST['hash'];
			$userName		= (empty($_POST['userName'])) 							? null 		: $_POST['userName'];
			$req 				= $_off->removeGeneratedGeoJSON($hash,$extent_0,$extent_1,$extent_2,$extent_3,$userName);
		}else if($what==="GET_BACKGROUND_INFO"){
			require_once 'libs/apps/backgrounds/class.backgrounds.php';
			$_bg		= new Backgrounds();
			$bg_id  = (empty($_POST['bg_id'])) 					? null 		: $_POST['bg_id'];
			$req 		= $_bg->getBackgroundData($bg_id);
			echo json_encode($req);
    }else{
			if ($handle = opendir('/var/www/html/bmaps/offline/')) {
				while (false !== ($entry = readdir($handle))) {
					if ($entry != "." && $entry != "..") {
						if (substr($entry, 0,strlen($project_name))===$project_name){
							array_push($retorno,$entry);
						}
					}
				}
				closedir($handle);
			}
      if(is_array($retorno)){
  			if(count($retorno)>0){
  				echo json_encode(array("status"=>"Accepted","message"=>$retorno));
  			}else{
  				echo json_encode(array("status"=>"Failed","message"=>"No offline data found"));
  			}
      }else{
        echo json_encode(array("status"=>"Failed","message"=>"No offline data found"));
      }
		}

	}
}

new ControllerIndex();
