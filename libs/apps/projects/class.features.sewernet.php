<?php
require_once('class.projects.sewernet.php');
class FeaturesSewernet extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************      GET INSERT FEAUTURE FORM     *****************
	//****************************************************************

	/***
		method getInsertFeatureForm
			gets insert feuture form

			@param $layer <string> layer name for obtaining db credentials
			@param $db_table <string> db table name
			@param $id_name <string> element type (node, gully, arc or connec)

			@return JSON

	***/

	public function getInsertFeatureForm($layer,$db_table,$expected_api_version){
		try{
			$startTime 	= microtime(true);
			$logData 		= array(
				"layer"									=> $layer,
				"db_table"							=> $db_table,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getInsertFeatureForm"
			);
			/*
				SELECT ud30.gw_fct_getinsertform('review_arc', 'es') AS result;
				gw_fct_getinsertform(database_table_id varchar, lang varchar)
			*/
			$layerInfo					= $this->_getLayerInfo(null);
			$query  						=	"SELECT SCHEMA.gw_fct_getinsertform('".$db_table."','".$_SESSION['lang']."','NULL') AS result";
			$formType						= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$formType,$startTime);
			if($formType['status']==="Accepted"){
				$res 				= $formType['message'];
				$this->_log("getInsertFeatureForm","form obtained for ".$layer." ".$db_table,"OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getInsertFeatureForm","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getInsertFeatureForm","Error in getInsertFeatureForm","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************     END  GET INSERT FEAUTURE FORM       ************
	//****************************************************************

	//****************************************************************
	//************             INSERT FEATURE        *****************
	//****************************************************************

	/***
		method insertFeature
			inserts a feauture

			@param $layer <string> layer name for obtaining db credentials
			@param $db_table <string> db table name
			@param $epsg <string> SRID
			@param $formData <JSON> form data
			@param $geometry <string> OL geometry

			@return JSON

	***/

	public function insertFeature($layer,$db_table,$epsg,$formData,$geometry,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"db_table"							=> $db_table,
				"epsg"									=> $epsg,
				"geometry"							=> $geometry,
				"formData"							=> json_encode($formData),
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "insertFeature"
			);
			$epsg 			= explode(":", $epsg);
			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}

			/*
			SELECT ud30.gw_fct_insertfeature('arc','review_arc',25831,'LINESTRING(419597.71911167 4576460.64008965,419598.612344125 4576460.09364868)','{"y1":23.1,"y2":11.8,"arc_type":"VARC_ORIFICE","matcat_id":"Concret","shape":"CON-RC150","geom1":71.1,"geom2":22,"annotation":"aaa","observ":"bbb","field_checked":false}');

			SELECT ud30.gw_fct_insertfeature(layer varchar, database_table_id varchar, srid integer, geometry varchar,form_data json);
			*/
			$layerInfo					= $this->_getLayerInfo(null);
			$query  						=	"SELECT SCHEMA.gw_fct_insertfeature('".$layer."','".$db_table."',".$epsg[1].",'".$geometry."','".json_encode($formData,JSON_FORCE_OBJECT)."') AS result";
			$insert							= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$insert,$startTime);
			if($insert['status']==="Accepted"){
				$res 				= $insert['message'];
				$this->_log("insertFeature","Insert feauture success","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in insertFeature","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"]['message'],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("insertFeature","Error in insertFeature","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************          END INSERT FEATURE        ****************
	//****************************************************************

	//****************************************************************
	//************              DELETE FEATURE        ****************
	//****************************************************************

	/***
		method deleteFeature
			deletes a feauture

			@param $layer <string> layer name for obtaining db credentials
			@param $db_table <string> db table name
			@param $id_name <string> element type (node, gully, arc or connec)
			@param $id <string> element id

			@return JSON

	***/

	public function deleteFeature($layer,$db_table,$id_name,$id,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"db_table"							=> $db_table,
				"id_name"								=> $id_name,
				"id"										=> $id,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "deleteFeature"
			);
			/*
			SELECT ud30.gw_fct_deletefeature('db_table',1) AS result;
			*/
			$layerInfo					= $this->_getLayerInfo(null);
			$query  						=	"SELECT SCHEMA.gw_fct_deletefeature('".$db_table."',".$id.") AS result";
			$insert							= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$insert,$startTime);
			if($insert['status']==="Accepted"){
				$res 				= $insert['message'];
				$this->_log("deleteFeature","deleteFeature success","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in deleteFeature","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"]['message'],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("deleteFeature","Error in deleteFeature","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}
	//****************************************************************
	//************          END DELETE FEATURE        ****************
	//****************************************************************

	//****************************************************************
	//************             UPDATE FEATURE         ****************
	//****************************************************************

	/***
		method updateFeatureSewernet
			Updates an Feature

			@param $layer <string> layer name for obtaining db credentials
			@param $db_table <string> db table name
			@param $key <string> db table field to update
			@param $key <string> value of the field to be updated
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@return JSON

	***/

	public function updateFeatureSewernet($layer,$db_table,$key,$value,$pol_id,$id_name,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"db_table"							=> $db_table,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"key"										=> $key,
				"value"									=> $value,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateFeature"
			);
			$layerInfo		= $this->_getLayerInfo(null);
			/*
				SELECT ud30.gw_fct_updatefeature('v_edit_man_chamber', 2, 'y2', '51.5') AS result;
				SELECT ud30.gw_fct_updatefeature(db_table string, id string, column string, value string);
			*/
			$query 							= "SELECT SCHEMA.gw_fct_updatefeature('".$db_table."','".$pol_id."', '".$key."', '".$value."') as result";
			$event							= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"update Feature success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"update Feature failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateFeature","Error in Feature review","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}

	//****************************************************************
	//************           END  UPDATE FEATURE      ****************
	//****************************************************************

	//****************************************************************
	//************         UPDATE FEATURE GEOMETRY    ****************
	//****************************************************************

	/***
		method updateFeatureGeometry
			updates geometry from a review element

			@param $layer <string> layer name for obtaining db credentials
			@param $db_table <string> db table name
			@param $epsg <string> SRID
			@param $pol_id <string> element id
			@param $id_name <string> element type (node, gully, arc or connec)
			@param $geometry <string> geometry string

			@return JSON

	***/

	public function	updateFeatureGeometry($layer,$db_table,$epsg,$pol_id,$id_name,$geometry,$expected_api_version){
		try{
			$startTime 	= microtime(true);
			$logData 		= array(
				"layer"									=> $layer,
				"db_table"							=> $db_table,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"epsg"									=> $epsg,
				"geometry"							=> $geometry,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateFeatureGeometry"
			);
			$layerInfo		= $this->_getLayerInfo(null);
			$epsg 				= explode(":", $epsg);

			/*
			SELECT ud30.gw_fct_updatefeaturegeometry('v_edit_man_chamber', 25831, 1, 'LINESTRING(419597.71911167 4576460.64008965,419598.612344125 4576460.09364868)') AS result;
			gw_fct_updatefeaturegeometry(db_table character varying, srid integer, id bigint, value_new character varying)
			*/
			$query 							= "SELECT SCHEMA.gw_fct_updatefeaturegeometry('".$db_table."',".$epsg[1].",".$pol_id.", '".$geometry."') as result";
			$event							= $this->_doQuery($layer,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"update Feature geometry success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"update Feature geometry failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateFeatureGeometry","Error in update Feature geometry","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}

	//****************************************************************
	//************      END UPDATE FEATURE GEOMETRY   ****************
	//****************************************************************
}
?>
