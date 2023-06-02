<?php

class ControllerIndex{
	private $_system;
	private $_hat;
	private $_shoe;
	function __construct()
	{

		//header('Content-Type: application/json');
		require_once 'libs/config.php'; //Archivo con configuraciones.
		$check				= new Check();
		$this->_system = System::singleton();//contiene objeto system
		$_POST 		= json_decode(file_get_contents('php://input'), true);

		require_once 'libs/apps/projects/class.projects.sewernet.php';
		$projects 	= new ProjectsSewernet();
		

		$what   	= (empty($_REQUEST['what'])) 				? null 			: $_REQUEST['what'];
		$token   	= (empty($_REQUEST['token'])) 			? null 		: $_REQUEST['token'];


		if($token===$_SESSION['token']){
			if($what==="ADD_VISIT"){
				$coordinates  			= (empty($_REQUEST['coordinates'])) 		? null 	: $this->_system->nohacker($_REQUEST['coordinates']);
				$element_id 			= (empty($_REQUEST['element_id'])) 			? null 	: $this->_system->nohacker($_REQUEST['element_id']);
				$epsg  					= (empty($_REQUEST['epsg'])) 				? null 	: $this->_system->nohacker($_REQUEST['epsg']);
				$layer_id  			    = (empty($_REQUEST['layer_id']))			? null 	: $this->_system->nohacker($_REQUEST['layer_id']);

				$datos		= array(
									"coordinates"	    => $coordinates,
									"element_id"	    => $element_id,
									"epsg"			    => $epsg,
									"layer_id"          => $layer_id,
																		"visit_type_id"     => "INSPECTION"
								);
				$id_visit	= $projects->addVisit($datos);

				echo json_encode($id_visit);
			}else if($what==="ADD_VISIT_INFO"){
				$visit_id  			= (empty($_REQUEST['visit_id'])) 			? null 	: $this->_system->nohacker($_REQUEST['visit_id']);
				$img 						= (empty($_REQUEST['file'])) 					? null 	: $this->_system->nohacker($_REQUEST['file']);
				$compass 				= (empty($_REQUEST['compass'])) 			? 0.00 	: $this->_system->nohacker($_REQUEST['compass']);
				$photos					= (empty($_REQUEST['photos'])) 		    ? null 	: $this->_system->nohacker($_REQUEST['photos']);
				$compasses			= $this->_system->nohacker($_REQUEST['compasses']);

						//unset properties not present in the table
				unset($_REQUEST['what']);
				unset($_REQUEST['visitInfo']);
				unset($_REQUEST['token']);
				unset($_REQUEST['visit_id']);
				unset($_REQUEST['file']);
				unset($_REQUEST['photos']);
				unset($_REQUEST['compass']);
				$data			= array();
				foreach($_REQUEST as $key => $value){
					array_push($data,array($key=>$value));
				}

				$datos		  = array(
											"img"               => $img,
											"visit_id"          => $visit_id,
											"compass"           => $compass,
											"data"        			=> $data,
											"photos"            => $photos,
											"compasses"         => $compasses,
											"visit_type_id"     => "INSPECTION"
										);

				$project	        = $projects->addVisitInfo($datos);
				echo json_encode($project);
			}else if($what==="GET_VISIT"){
				$element_id 	= (empty($_REQUEST['element_id'])) 			? null 	: $this->_system->nohacker($_REQUEST['element_id']);
				$layer_id  	    = (empty($_REQUEST['layer_id']))			? null 	: $this->_system->nohacker($_REQUEST['layer_id']);
								$project	    = $projects->visitExists($element_id,$layer_id);
				echo json_encode($project);
						}else if($what==="GET_VISIT_INFO"){
								$id  			= (empty($_REQUEST['visit_id'])) 		? null 	: $this->_system->nohacker($_REQUEST['visit_id']);
								$project	    = $projects->getVisit($id);
				echo json_encode($project);
			}else if($what==="REMOVE_VISIT"){
				$id  			= (empty($_REQUEST['visit_id'])) 		    ? null 	: $this->_system->nohacker($_REQUEST['visit_id']);
				$project 		= $projects->removeVisit($id);
				echo json_encode($project);
			}else if($what==="REMOVE_EVENT"){
				$visit_id  		= (empty($_REQUEST['visit_id'])) 		    ? null 	: $this->_system->nohacker($_REQUEST['visit_id']);
				$id  			= (empty($_REQUEST['event_id'])) 		    ? null 	: $this->_system->nohacker($_REQUEST['event_id']);
				$project 		= $projects->removeEvent($id,$visit_id);
				echo json_encode($project);

			}else if($what==="ADD_GEOMETRY"){
				$geometry  				= (empty($_REQUEST['geom'])) 				? null 	: $this->_system->nohacker($_REQUEST['geom']);
				$layer 					= (empty($_REQUEST['layer'])) 				? null 	: $this->_system->nohacker($_REQUEST['layer']);
				$epsg  					= (empty($_REQUEST['epsg'])) 				? null 	: $this->_system->nohacker($_REQUEST['epsg']);
				$tableIdName  			= (empty($_REQUEST['tableIdName']))			? null 	: $this->_system->nohacker($_REQUEST['tableIdName']);
				$img 					= (empty($_REQUEST['file'])) 				? null 	: $this->_system->nohacker($_REQUEST['file']);
				//unset properties not present in the table
				unset($_REQUEST['what']);
				unset($_REQUEST['geom']);
				unset($_REQUEST['token']);
				unset($_REQUEST['layer']);
				unset($_REQUEST['epsg']);
				unset($_REQUEST['tableIdName']);
				unset($_REQUEST['file']);
				$data			= array();
				foreach($_REQUEST as $key => $value){
					array_push($data,array($key=>$value));
				}
				/*echo "<pre>";
				print_r($data);
				echo "</pre>";*/
				$project 	= $projects->addGeometry($data,$layer,$epsg,$geometry,$tableIdName);
				/*echo "<pre>";
				print_r($project);
				echo "</pre>";*/
				if($img){
					$datos		= array(
									"img"			=> $img,
									"feature_id"	=> $project['message'],
									"layer"			=> $layer
								);
					$id_image	= $projects->addImage($datos);
				}
				echo json_encode($project);
			}else if($what==="REMOVE_FEATURE"){
				$id  			= (empty($_REQUEST['id'])) 		? null 	: $this->_system->nohacker($_REQUEST['id']);
				$layer  		= (empty($_REQUEST['layer'])) 	? null 	: $this->_system->nohacker($_REQUEST['layer']);
				$tableIdName  	= (empty($_REQUEST['tableIdName'])) ? null 	: $this->_system->nohacker($_REQUEST['tableIdName']);
				$project 		= $projects->removeFeature($id,$layer,$tableIdName);
				echo json_encode($project);
			}else if($what==="UPDATE_FEATURE"){
				$id  			= (empty($_REQUEST['id'])) 			? null 	: $this->_system->nohacker($_REQUEST['id']);
				$geometry  		= (empty($_REQUEST['geom'])) 		? null 	: $this->_system->nohacker($_REQUEST['geom']);
				$layer 			= (empty($_REQUEST['layer'])) 		? null 	: $this->_system->nohacker($_REQUEST['layer']);
				$epsg  			= (empty($_REQUEST['epsg'])) 		? null 	: $this->_system->nohacker($_REQUEST['epsg']);
				$tableIdName  	= (empty($_REQUEST['tableIdName'])) ? null 	: $this->_system->nohacker($_REQUEST['tableIdName']);


				//unset properties not present in the table
				unset($_REQUEST['what']);
				unset($_REQUEST['geom']);
				unset($_REQUEST['token']);
				unset($_REQUEST['layer']);
				unset($_REQUEST['epsg']);
				unset($_REQUEST['id']);
				unset($_REQUEST['tableIdName']);
				$data			= array();
				foreach($_REQUEST as $key => $value){
					array_push($data,array($key=>$value));
				}
				$project 	= $projects->updateFeature($data,$id,$epsg,$layer,$tableIdName,$geometry);
				echo json_encode($project);
			}else if($what==="ADD_IMAGE"){
				$visit_id  		= (empty($_REQUEST['visit_id'])) 			? null 	: $this->_system->nohacker($_REQUEST['visit_id']);
				$layer 				= (empty($_REQUEST['layer'])) 		    ? null 	: $this->_system->nohacker($_REQUEST['layer']);
				$img 					= (empty($_REQUEST['file'])) 		      ? null 	: $this->_system->nohacker($_REQUEST['file']);
				$compass 			= (empty($_REQUEST['compass'])) 		  ? 0.00 	: $this->_system->nohacker($_REQUEST['compass']);
        $metaData 		= (empty($_REQUEST['metaData'])) 		  ? null 	: $_REQUEST['metaData'];
				$datos				= array(
												"img"						=> $img,
												"visit_id"	    => $visit_id,
												"compass"       => $compass,
												"layer"					=> $layer
								);
				$addImg			= $projects->addImage($datos,$layer,$metaData);
				echo json_encode($addImg);
			}else if($what==="REMOVE_IMAGE"){
				$feature_id  	= (empty($_REQUEST['feature_id'])) 			? null 	: $this->_system->nohacker($_REQUEST['feature_id']);
				$layer 			= (empty($_REQUEST['layer'])) 		? null 	: $this->_system->nohacker($_REQUEST['layer']);
				$img_id 		= (empty($_REQUEST['img_id'])) 		? null 	: $this->_system->nohacker($_REQUEST['img_id']);
				$datos			= array(
									"img_id"		=> $img_id,
									"feature_id"	=> $feature_id,
									"layer"			=> $layer
								);
				$addImg			= $projects->removeImg($datos);
				echo json_encode($addImg);
			}else if($what==="HEARTBEAT"){
				echo "OK";
			}
		}else{
			echo json_encode(array("status"=>"Failed","message"=>"Cross site injection detected"));
		}
	}
}

new ControllerIndex();
