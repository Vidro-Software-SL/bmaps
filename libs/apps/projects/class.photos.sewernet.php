<?php
require_once('class.projects.sewernet.php');
class PhotosSewernet extends ProjectsSewernet {
	protected $_system;
	/***
		method insertEventPhoto
			inserts a Photo

			@param $layer <string> layer name for obtaining db credentials
			@param $visit_id <int> visit id
			@param $event_id <string> mongoDB hash
			@param $url <string> url for giswater
			@param $compass <double>
			@param $layerInfo <JSON> db credentials - optional

			@return JSON

	***/
	public function insertEventPhoto($layer,$visit_id,$event_id,$hash,$url,$compass,$layerInfo=null){
		try{
	
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log($logData['evt'],"Error in inserteventphoto","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	/***
		method getPhotos

			@param $id <int>
			@param $type <string> `visit` or `event`
			@param $layer <string> layer name for obtaining db credentials - OPTIONAL
			@param $layerInfo <json> db credentials - OPTIONAL

			@return JSON

	***/
	public function getPhotos($id,$type,$layer=null,$layerInfo=null,$expected_api_version){
		try{
			$startTime 	= microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"id"										=> $id,
				"type"									=> $type,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getPhotos"
			);
			if($type!="visit" && $type!="event"){
				return array("status"=>"Failed","message"=>"type ".$type." not admitted","code"=>501);
			}else{
				//get db credentials
				if($layerInfo===null){
					$layerInfo				= $this->_getLayerInfo(null);
				}
				$retorno 					= array();
				/*
				SELECT ud30.gw_fct_getfotos(123, 'visit');
				*/
				$query 						= "SELECT SCHEMA.gw_fct_getfotos('".$id."', '".$type."') AS result";
				$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'],$query);
				$docs							= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
				$logData						= $this->_prepareLog($logData,$query,$docs,$startTime);
				if($docs['status']==="Accepted"){
					$res 			= $docs['message'];
					if($res){
						$retorno = $res;
						//store log
						$this->_log($logData['evt'],"getPhotos success","OK",$logData);
						return array("status"=>"Accepted","message"=>$retorno,"code"=>200);
					}else{
						//store log
						$this->_log($logData['evt'],"getPhotos no data","KO",$logData);
						return array("status"=>"Failed","message"=>"gw_fct_getfotos not returning data","code"=>404);
					}

				}else{
					//store log
					$logData['layerInfo'] = $layerInfo;
					$this->_log($logData['evt'],"getPhotos failed - query error","KO",$logData);
					return array("status"=>"Failed","message"=>$docs,"code"=>501);
				}
			}
		}catch(Exception $e){
			//****** Error
			$layerInfo['pwd_db_view']		= "*****";
			$layerInfo['pwd_db_edit']		= "*****";
			$logData["layerInfo"]				= $layerInfo;
			$logData['Exception'] 			= $e->getMessage();
			$logData['ExceptionLine'] 	= $e->getLine();
			$this->_log("getPhotos","getPhotos failed","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>402);
		}
	}

	/***
		method deleteEventPhoto
			deletes a Photo

			@param $layer <string> layer name for obtaining db credentials
			@param $photo_id <int> event photo id
			@param $hash <string> mongoDB hash

			@param $layerInfo <JSON> db credentials - optional

			@return JSON

	***/
	public function deleteEventPhoto($hash,$layer,$layerInfo=null,$expected_api_version){
		try{
			$startTime 	= microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"hash"									=> $hash,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "deleteEventPhoto"
			);

			/*
				FUNCTION ud30.gw_fct_deleteeventphoto( event_photo_id integer)
			*/
			$query 			= "SELECT SCHEMA.gw_fct_deleteeventphoto('".$hash."') AS result";
			if($layerInfo===null){
				$layerInfo	= $this->_getLayerInfo(null);
			}
			$photo							= $this->_doQuery($layer,$query,$layerInfo,$logData,"INSERT",$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$photo,$startTime);
			if($photo['status']==="Accepted"){
				$res 			= $photo['message'];
				$this->removeImg(array("img_id"=>$hash));
				//store log
				$this->_log($logData['evt'],"deleteeventphoto success","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"deleteeventphoto error","KO",$logData);
				return array("status"=>"Failed","message"=>$photo,"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("deleteEventPhoto","Error in deleteeventphoto","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

  public function uploadPhoto($datos){
    
  }

  public function uploadExternalPhoto($datos){
   
  }



  public function readDocumentData($id){
 
  }



}
