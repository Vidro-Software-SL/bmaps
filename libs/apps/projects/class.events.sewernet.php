<?php
require_once('class.projects.sewernet.php');
class EventsSewernet extends ProjectsSewernet {
	protected $_system;




	//****************************************************************
	//************       GET FORM TYPE AND EVENT     *****************
	//****************************************************************

	/***
		method getEventFormTypeAndEvent
			gets type of event for form and event to view

			@param $visit_parameter_id <string> insp_arc_p1,insp_arc_p2, etc..
			@param $event_id <int> event if for get event info
			@param $layer <string> layer name for obtaining db credentials

			@return JSON

	***/

	public function getEventFormTypeAndEvent($visit_parameter_id,$arc_id,$id_name,$layer,$expected_api_version){
		try{
			$startTime = microtime(true);
			if($arc_id=="" || $arc_id==null){
				$arc_id = "NULL";
			}else{
				$arc_id = "'".$arc_id."'";
			}
			$logData 	= array(
				"layer"									=> $layer,
				"visit_parameter_id"		=> $visit_parameter_id,
				"arc_id"								=> $arc_id,
				"id_name"								=> $id_name,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getEventFormTypeAndEvent"
			);
			//arc id is only mandatory for arc. If is node_id, returns an error
			if($id_name!="arc_id"){
				$arc_id = "NULL";
			}
			$layerInfo					= $this->_getLayerInfo(null);
			//$query  						=	"SELECT SCHEMA.gw_fct_geteventform('".$visit_parameter_id."',".$arc_id.") AS result";

			$query  						=	"SELECT SCHEMA.gw_fct_geteventform('".$visit_parameter_id."',".$arc_id.",'".$_SESSION['lang']."') AS result";
			$formType						= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$formType,$startTime);
			if($formType['status']==="Accepted"){
				$res 				= $formType['message'];
				$retorno		= array(
					'formToDisplay'		=> $res['formToDisplay'],
					'fields'					=> $res['fields']
				);
				$this->_log("getEventFormTypeAndEvent","form obtained for ".$visit_parameter_id,"OK",$logData);
				return array("status"=>"Accepted","message"=>$retorno,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getEventFormTypeAndEvent","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getEventFormTypeAndEvent","Error in getEventFormTypeAndEvent","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************     END GET FORM TYPE AND EVENT    ****************
	//****************************************************************

	//****************************************************************
	//************             INSERT EVENT           ****************
	//****************************************************************

	/***
		method insertEvent
			inserts and event

			@param $layer <string> layer name for obtaining db credentials
			@param $visit_id <int> visit id
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@param $eventData <array> array with event data
			@param $formId <string> form identifier

			@return JSON

	***/
	public function insertEvent($layer,$visit_id,$pol_id,$id_name,$eventData,$formId,$photos,$compasses,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"visit_id"							=> $visit_id,
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"formId"								=> $formId,
				"eventData"							=> $eventData,
				"photos"								=> $photos,
				"compasses"							=> $compasses,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "insertEvent"
			);
			if(array_key_exists('value', $eventData)){
				if($eventData['value']===NULL || $eventData['value']==""){
					$eventData['value'] = "NULL";
				}else{
					$eventData['value'] = "'".$eventData['value']."'";
				}
			}else{
				$eventData['value'] = "NULL";
			}
			if(array_key_exists('position_id', $eventData)){
				if($eventData['position_id']===NULL || $eventData['position_id']==""){
					$eventData['position_id'] = "NULL";
				}
				if($eventData['position_id']===NULL || $eventData['position_id']=="" || $eventData['position_id']=="NULL"){
					$eventData['position_id'] = "NULL";
				}else{
					$eventData['position_id'] = "'".$eventData['position_id']."'";
				}
			}else{
				$eventData['position_id'] = "NULL";
			}
			if(array_key_exists('position_value', $eventData)){
				if($eventData['position_value']===NULL || $eventData['position_value']==""){
					$eventData['position_value'] = "NULL";
				}else{
					$eventData['position_value'] = "NULL";
				}
			}else{
				$eventData['position_value'] = "NULL";
			}
			if(array_key_exists('parameter_id', $eventData)){
				if($eventData['parameter_id']===NULL || $eventData['parameter_id']==""){
					$eventData['parameter_id'] = "NULL";
				}
			}else{
				$eventData['parameter_id'] = "NULL";
			}
			if(array_key_exists('parameter_id', $eventData)){
				if($eventData['parameter_id']===NULL || $eventData['parameter_id']==""){
					$eventData['parameter_id'] = "NULL";
				}
			}else{
				$eventData['parameter_id'] = "NULL";
			}
			if(array_key_exists('value1', $eventData)){
				if($eventData['value1']===NULL || $eventData['value1']==""){
					$eventData['value1'] = "NULL";
				}else{
					$eventData['value1'] = "'".$eventData['value1']."'";
				}
			}else{
				$eventData['value1'] = "NULL";
			}
			if(array_key_exists('value2', $eventData)){
				if($eventData['value2']===NULL || $eventData['value2']==""){
					$eventData['value2'] = "NULL";
				}
			}else{
				$eventData['value2'] = "NULL";
			}
			if(array_key_exists('geom1', $eventData)){
				if($eventData['geom1']===NULL || $eventData['geom1']==""){
					$eventData['geom1'] = "NULL";
				}
			}else{
				$eventData['geom1'] = "NULL";
			}
			if(array_key_exists('geom2', $eventData)){
				if($eventData['geom2']===NULL || $eventData['geom2']==""){
					$eventData['geom2'] = "NULL";
				}
			}else{
				$eventData['geom2'] = "NULL";
			}
			if(array_key_exists('geom3', $eventData)){
				if($eventData['geom3']===NULL || $eventData['geom3']==""){
					$eventData['geom3'] = "NULL";
				}
			}else{
				$eventData['geom3'] = "NULL";
			}
			if(array_key_exists('text', $eventData)){
				if($eventData['text']===NULL || $eventData['text']==""){
					$eventData['text'] = "NULL";
				}else{
					$eventData['text'] = "'".$eventData['text']."'";
				}
			}else{
				$eventData['text'] = "NULL";
			}

			$fields = "(".$eventData['value'].",".$visit_id.",".$eventData['position_id'];
			$fields .=",".$eventData['position_value'].",'".$eventData['parameter_id']."'";
			$fields .= ",".$eventData['value1'].",".$eventData['value2'].",".$eventData['geom1'];
			$fields .=",".$eventData['geom2'].",".$eventData['geom3'].",".$eventData['text'].",'web')";

			/*
			Me envias los datos del F24:

			SELECT ud30.gw_fct_insertevent('1234', 1157,5111,232.5,'insp_arc_p3','321.5',418930,4576800.6,161.1,252.658) AS result

			O los del F22:

			SELECT ud30.gw_fct_insertevent(NULL, 1157,NULL,NULL,'insp_arc_p3','321.5',NULL,NULL,NULL,NULL) AS result
			FUNCTION ud30.gw_fct_insertevent(ext_code character varying, visit_id bigint, position_id character varying, position_value double precision, parameter_id character varying, value_arg character varying,  value2 integer, geom1 double precision, geom2 double precision, geom3 double precision)

			*/
			$query 						= "SELECT SCHEMA.gw_fct_insertevent".$fields." AS result";
			$layerInfo				= $this->_getLayerInfo(null);
			$eventId					= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData				= $this->_prepareLog($logData,$query,$eventId,$startTime);
			if($eventId['status']==="Accepted"){
				$res 				= $eventId['message'];
				$retorno		= array(
					'event_id'				=> $res['id']
				);
				if(count($photos)>0){
					require_once('class.photos.sewernet.php');
					$photoClass 				= new PhotosSewernet();
					$i = 0;
					foreach ($photos as $photo) {
						$url = "REPLACE_ME/external.image.php?img=".$photo;
						$photoClass->insertEventPhoto($layer,$visit_id,$res['id'],$photo,$url,$compasses[$i],$layerInfo);
						$i++;
					}
				}
				//store log
				$this->_log($logData['evt'],"insertEvent success","OK",$logData);
				return array("status"=>"Accepted","message"=>$retorno,"code"=>200);
			}else{
				$this->_log($logData['evt'],"insertEvent error","KO",$logData);
				return array("status"=>"Failed","message"=>$eventId,"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("insertEvent","Error in insertEvent","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************           END INSERT EVENT         ****************
	//****************************************************************

	/***
		method getEvents
			gets events from a visit

			@param $layer <string> layer name for obtaining db credentials
			@param $visit_id <int> visit id
			@param $id_name <string> name of the id field of the table/view to query
			@param $device <int>
			@param $layerInfo <JSON> db credentials - optional

			@return JSON

	***/
	public function getEvents($layer,$visit_id,$id_name,$device,$layerInfo=null,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"visit_id"							=> $visit_id,
				"id_name"								=> $id_name,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getEvents"
			);
			if($layerInfo===null){
				$layerInfo		= $this->_getLayerInfo(null);
			}
			/*
			gw_fct_getevents(element_type character varying, device integer, visit_id bigint)
			SELECT ud30.gw_fct_getevents('arc', 3, 1290);
			*/
			$query 		= "SELECT SCHEMA.gw_fct_getevents('".$this->_clean_id_name($id_name)."', ".$device.", ".$visit_id.") AS result";
			$events		= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData	= $this->_prepareLog($logData,$query,$events,$startTime);
			if($events['status']==="Accepted"){
				$res 				= $events['message'];
				$retorno		= array(
					'events'				=> $res['events']
				);
				//store log
				$this->_log($logData['evt'],"getEvents success","OK",$logData);
				return array("status"=>"Accepted","message"=>$retorno,"code"=>200);

			}else{
				$this->_log($logData['evt'],"getEvents error","KO",$logData);
				return array("status"=>"Failed","message"=>$events,"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getEvents","Error in getEvents","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	/***
		method getEventSwernet
			gets events from a visit

			@param $layer <string> layer name for obtaining db credentials
			@param $event_id <int> event id
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query

			@return JSON

	***/
	public function getEventSwernet($layer,$event_id,$pol_id,$id_name,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"event_id"							=> $event_id,
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getEventSwernet"
			);
			$layerInfo		= $this->_getLayerInfo(null);

			/*
				SELECT ud30.gw_fct_getevent(3931, '5237') AS result;
				gw_fct_getevent( event_id bigint, arc_id character varying)
			*/
			$query 					= "SELECT SCHEMA.gw_fct_getevent(".$event_id.", '".$pol_id."','".$_SESSION['lang']."') AS result";
			$events					= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData				= $this->_prepareLog($logData,$query,$events,$startTime);
			if($events['status']==="Accepted"){
				$res 				= $events['message'];
				//get photos from event
				require_once('class.photos.sewernet.php');
				$photoClass = new PhotosSewernet();
				$photos 		= $photoClass->getPhotos($event_id,"event",$layer,$layerInfo,$expected_api_version);
				if($photos['status']==="Accepted"){
					if(count($photos['message']['photos'])>0){
						$res['event_data']['photos'] = $photos['message']['photos'];
					}
				}else{
					$res['event_data']['photos'] = array();
				}

				$retorno		= array(
					'event_data'				=> $res['event_data'],
					'form_data'					=> $res['form_data']
				);

				//store log
				$this->_log($logData['evt'],"getEvent success","OK",$logData);
				return array("status"=>"Accepted","message"=>$retorno,"code"=>200);
			}else{
				$this->_log($logData['evt'],"getEvent error","KO",$logData);
				return array("status"=>"Failed","message"=>$events,"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getEventSwernet","Error in getEvents","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	/***
		method updateEvent
			Updates an event

			@param $layer <string> layer name for obtaining db credentials
			@param $event_id <int> unique ID for event
			@param $key <string> db table field to update
			@param $key <string> value of the field to be updated
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@return JSON

	***/

	public function updateEvent($layer,$event_id,$key,$value,$pol_id,$id_name,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"event_id"							=> $event_id,
				"key"										=> $key,
				"value"									=> $value,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateEvent"
			);
			$layerInfo		= $this->_getLayerInfo(null);
			/*
				gw_fct_updateevent( event_id bigint, column_name character varying, value_new character varying)
				SELECT ud30.gw_fct_updateevent(3931,'ext_code', '32155') AS result;
			*/
			$query 					= "SELECT SCHEMA.gw_fct_updateevent(".$event_id.", '".$key."', '".$value."') as result";
			$event					= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData				= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"update event success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"update event failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData["query"]					= $query;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("updateEvent","Error in updateEvent","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}

	/***
		method deleteEvent
			deletes an event

			@param $layer <string> layer name for obtaining db credentials
			@param $event_id <int> unique ID for event
			@return JSON

	***/
	public function deleteEvent($layer,$event_id,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"event_id"							=> $event_id,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "deleteEvent"
			);
			$layerInfo		= $this->_getLayerInfo(null);
			/*
				SELECT ud30.gw_fct_deleteevent(3930);
			*/
			$query 					= "SELECT SCHEMA.gw_fct_deleteevent(".$event_id.") as result";
			$event					= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData				= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$this->_log($logData['evt'],"deleteEvent success","OK",$logData);
				//remove photos from mongo
				require_once('class.photos.sewernet.php');
				$photoClass = new PhotosSewernet();
				$photos 		= $photoClass->getPhotos($event_id,"event",$layer,$layerInfo,$expected_api_version);
				if($photos['status']==="Accepted"){
					if(count($photos['message']['photos'])>0){
						foreach($photos['message']['photos'] as $photo){
							$this->removeImg(array("img_id"=>$photo));
						}
					}
				}
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"deleteEvent failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData["query"]					= $query;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("deleteEvent","Error in deleteEvent","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}

}
?>
