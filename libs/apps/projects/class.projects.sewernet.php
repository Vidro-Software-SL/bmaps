<?php
require_once('class.projects.mollet_black.php');

class ProjectsSewernet extends ProjectsMollet_black
{
	protected $_system;

	//****************************************************************
	//*******************        PG FUNCTIONS   **********************
	//****************************************************************

	/***
		method upsertVisit
			upserts a visit (inserts a new visit or returns a previous visit)

			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@param $coordinates <array> (float,float)
			@param $epsg <string> EPSG:xxxx
			@param $device <int>

			@return JSON

	 ***/

	public function upsertVisit($layer, $pol_id, $id_name, $coordinates, $epsg, $device, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"coordinates"						=> $coordinates,
				"epsg"									=> $epsg,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "upsertVisit"
			);
			//get db credentials
			$layerInfo				= $this->_getLayerInfo(null);
			$retorno 					= array();
			$logData['schema'] = $layerInfo['schema'];
			$username					= 'user_dev'; //TO BE REPLACED WHEN user's email is created as a pg user!!!!
			$epsg 						= explode(":", $epsg);
			$query 						= "SELECT SCHEMA.gw_fct_upsertvisit(" . $coordinates . "," . $epsg[1] . ",'" . $this->_clean_id_name($id_name) . "', '" . $pol_id . "', " . $device . ",'" . $username . "') AS result";
			$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs							= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData					= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				if (array_key_exists('visicat_id_options', $res)) {
					$retorno['visicat_id_options'] 	= $res['visicat_id_options'];
				}
				if (array_key_exists('visicat_id', $res)) {
					$retorno['visicat_id'] 					= $res['visicat_id'];
				}
				if (array_key_exists('parameter_type_options', $res)) {
					$retorno['parameter_type_options'] 				= $res['parameter_type_options'];
				}
				if (array_key_exists('parameter_type', $res)) {
					$retorno['parameter_type'] 	= $res['parameter_type'];
				}
				if (array_key_exists('parameter_id_options', $res)) {
					$retorno['parameter_id_options'] 					= $res['parameter_id_options'];
				}
				if (array_key_exists('action', $res)) {
					$retorno['action']								= "update";
				}
				if (array_key_exists('visit_id', $res)) {
					$retorno['visit_id'] 							= $res['visit_id'];
					require_once('class.events.sewernet.php');
					$events 				= new EventsSewernet();
					$eventList 			= $events->getEvents($layer, $res['visit_id'], $id_name, $device, null, $expected_api_version);
					if ($eventList['status'] === "Accepted") {
						$retorno['events'] = $eventList['message']['events'];
					} else {
						$retorno['events'] = [];
					}
				}
				if (array_key_exists('ext_code', $res)) {
					$retorno['code'] 							= $res['ext_code'];
				}
				if (array_key_exists('visit_isDone', $res)) {
					$retorno['visit_isDone']					= $res['visit_isDone'];
				}
				//store log
				$this->_log($logData['evt'], "upsert visit success", "OK", $logData);
				return array("status" => "Accepted", "message" => $retorno, "code" => 200);
			} else {
				//store log
				$this->_log($logData['evt'], "upsert visit failed - query error", "KO", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]				= $layerInfo;
			$logData['Exception'] 			= $e->getMessage();
			$logData['ExceptionLine'] 	= $e->getLine();
			$this->_log("upsertVisit", "upsert visit failed", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "query" => $query, "code" => 402);
		}
	}

	/***
		method getParameterIdFromParameterType
			get parameter_id from a given parameter type

			@param $layer <string> layer name for obtaining db credentials
			@param $parameter_type <string> parameter_id
			@param $layerInfo <JSON> db credentials - optional

			@return JSON

	 ***/

	public function getParameterIdFromParameterType($layer, $parameter_type, $id_name, $layerInfo = null, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"parameter_type" 				=> $parameter_type,
				"id_name"								=> $id_name,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getParameterIdFromParameterType"
			);
			if ($layerInfo === null) {
				$layerInfo		= $this->_getLayerInfo(null);
			}
			$logData['schema']	= $layerInfo['schema'];
			$query 							= "SELECT SCHEMA.gw_fct_getparameteridfromparametertype('" . $parameter_type . "','" . $this->_clean_id_name($id_name) . "') AS result";
			$paramaterId				= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData						= $this->_prepareLog($logData, $query, $paramaterId, $startTime);
			if ($paramaterId['status'] === "Accepted") {
				$res 			= $paramaterId['message'];
				$this->_log($logData['evt'], "getParameterIdFromParameterType success", "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				return array("status" => "Failed", "message" => $paramaterId['message'], "code" => $paramaterId['code']);
			}
		} catch (Exception $e) {
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}

	/***
		method getVisitsFromFeature

			@param $device <int>
			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@param $opt_array <array> Array with filter options [visit_start], [visit_end], [parameter_type], [parameter_id]

			@return JSON

	 ***/

	public function getVisitsFromFeature($device, $layer, $pol_id, $id_name, $opt_array, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"opt_array"							=> $opt_array,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getVisitsFromFeature"
			);
			//get db credentials
			$layerInfo				= $this->_getLayerInfo(null);
			$retorno 					= array();
			$opt_visit_start 	= null;
			$opt_visit_end 		= null;
			if ($opt_array != null) {
				if (array_key_exists('visit_start', $opt_array) && $opt_array['visit_start'] != null) {
					$opt_visit_start = $opt_array['visit_start'];
				}
				if (array_key_exists('visit_end', $opt_array) && $opt_array['visit_end'] != null) {
					$opt_visit_end 	= $opt_array['visit_end'];
				}
			}
			unset($opt_array['visit_start']);
			unset($opt_array['visit_end']);
			if ($opt_array) {
				$sub = json_encode($opt_array);
				$data = "$$" . $sub . "$$";
			} else {
				$data = 'NULL';
			}

			/*
			SELECT ud30.gw_fct_getvisitsfromfeature('arc', '1236', 3, '2011-01-15 19:06:38.265711+01', '2019-01-15 19:06:38.265711+01');
			gw_fct_getvisitsfromfeature(element_type character varying, id character varying, device integer, visit_start timestamp without time zone, visit_end  timestamp without time zone)
			*/
			$logData['schema'] = $layerInfo['schema'];
			$query = "SELECT SCHEMA.gw_fct_getvisitsfromfeature('" . $this->_clean_id_name($id_name) . "', '" . $pol_id . "', " . $device . ",'" . $opt_visit_start . "','" . $opt_visit_end . "'," . $data . ") AS result";
			//$query 						= "SELECT SCHEMA.gw_fct_getvisitsfromfeature('".$this->_clean_id_name($id_name)."', '".$pol_id."', ".$device.",'".$opt_visit_start."','".$opt_visit_end."') AS result";
			$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs							= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData					= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {

				$res 			= $docs['message'];

				$this->_log($logData['evt'], "getVisitsFromFeature success", "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				//store log
				$this->_log($logData['evt'], "getVisitsFromFeature failed - query error", "KO", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error
			$layerInfo['pwd_db_view']		= "*****";
			$layerInfo['pwd_db_edit']		= "*****";
			$logData["layerInfo"]				= $layerInfo;
			$logData['Exception'] 			= $e->getMessage();
			$logData['ExceptionLine'] 	= $e->getLine();
			$this->_log("getVisitsFromFeature", "getVisitsFromFeature failed", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "query" => $query, "code" => 402);
		}
	}

	/***
    method getInfoFiles

      @param $device <int>
      @param $layer <string> layer name for obtaining db credentials
      @param $pol_id <int> feature id
      @param $id_name <string> name of the id field of the table/view to query
      @param $opt_array <array> Array with filter options [visit_start], [visit_end], [parameter_type], [parameter_id]

      @return JSON

	 ***/

	public function getInfoFiles($device, $pol_id, $id_name, $selected_layer, $tableName, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"selected_layer" => $selected_layer,
				"tableName" => $tableName,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getInfoFiles"
			);
			//get db credentials
			$layerInfo				= $this->_getLayerInfo(null);
			$retorno 					= array();
			$logData['schema']		= $layerInfo['schema'];


			$query 						= "SELECT SCHEMA.gw_fct_getinfofiles('" . $this->_clean_id_name($id_name) . "', '" . $pol_id . "','" . $selected_layer . "','" . $tableName . "', " . $device . ") AS result";
			$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs							= $this->_doQuery(null, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData					= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				//store log
				$this->_log($logData['evt'], "getInfoFiles success", "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				//store log
				$this->_log($logData['evt'], "getInfoFiles failed - query error", "KO", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error
			$layerInfo['pwd_db_view']		= "*****";
			$layerInfo['pwd_db_edit']		= "*****";
			$logData["layerInfo"]				= $layerInfo;
			$logData['Exception'] 			= $e->getMessage();
			$logData['ExceptionLine'] 	= $e->getLine();
			$this->_log("getInfoFiles", "getInfoFiles failed", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "query" => $query, "code" => 402);
		}
	}

	/***
    method setfeaturefile

      @param $pol_id <int>
      @param $idName <string>
      @param $info_type <int>
			@param $tableName <string>
			@param $photos <array>
			@param $deviceTrace <array>
      @param $device <int>
      @param $expected_api_version <satring>

      @return JSON

	 ***/

	public function setfeaturefile($pol_id, $idName, $info_type, $tableName, $photos, $deviceTrace, $device, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id" => $pol_id,
				"device" => $device,
				"info_type" => $info_type,
				"tableName" => $tableName,
				"idName" => $idName,
				"expected_api_version" => $expected_api_version,
				"deviceTrace" => json_decode($deviceTrace),
				"photos" => $photos,
				"evt" => "setfeaturefile"
			);

			$data 	= '$${';
			$data 	.= '"client":{"device":' . $device . ',"infoType":' . $info_type . ',"lang":"' . $_SESSION['lang'] . '"},';
			$data 	.= '"form":{},';
			$data 	.= '"feature":{"tableName":"' . $tableName . '", "feature_id":"' . $pol_id . '"},';
			$data 	.= '"data":{"photos":' . $photos . ',"deviceTrace":' . $deviceTrace;
			$data 	.= '}';
			$data 	.= '}$$';
			//get db credentials
			$layerInfo = $this->_getLayerInfo(null);
			$retorno = array();
			$logData['schema'] = $layerInfo['schema'];

			/*
      SELECT ws_sample32.gw_fct_setfeaturefile(
            $${"client":
              {"device":3,"infoType":0,"lang":"en"},
              "form":{},
              "feature":{"tableName":"v_edit_node", "feature_id":29417},
              "data":{"photos":[{"photo_url":"https://./bmaps/external.image.php?img=","hash":"5eb537a10eaa00586d364a17"}],
              "deviceTrace":{"xcoord":434644.8641550138,"ycoord":4598996.589299866,"compass":0}}}$$) AS result
       */
			$query 						= "SELECT SCHEMA.gw_fct_setfeaturefile(" . $data . ") AS result";
			$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs							= $this->_doQuery(null, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData					= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				//store log
				$this->_log($logData['evt'], "setfeaturefile success", "OK", $logData);
				//update attached photos
				$this->updateAttachedFiles($photos);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				//store log
				$this->_log($logData['evt'], "setfeaturefile failed - query error", "KO", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error
			$layerInfo['pwd_db_view']		= "*****";
			$layerInfo['pwd_db_edit']		= "*****";
			$logData["layerInfo"]				= $layerInfo;
			$logData['Exception'] 			= $e->getMessage();
			$logData['ExceptionLine'] 	= $e->getLine();
			$this->_log("setfeaturefile", "setfeaturefile failed", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 402);
		}
	}

	/***
    method deleteFeatureFile

      @param $pol_id <int>
      @param $file_id <int>
      @param $info_type <int>
      @param $device <int>
      @param $expected_api_version <satring>

      @return JSON

	 ***/

	public function deleteFeatureFile($pol_id, $file_id, $info_type, $device, $expected_api_version)
	{
		//try{
		$startTime = microtime(true);
		$logData 	= array(
			"pol_id" => $pol_id,
			"device" => $device,
			"info_type" => $info_type,
			"file_id" => $file_id,
			"expected_api_version" => $expected_api_version,
			"evt" => "deleteFeatureFile"
		);

		$data 	= '$${';
		$data 	.= '"client":{"device":' . $device . ',"infoType":' . $info_type . ',"lang":"' . $_SESSION['lang'] . '"},';
		$data 	.= '"form":{},';
		$data 	.= '"feature":{"id":"' . $pol_id . '"},';
		$data 	.= '"data":{"file_id":"' . $file_id . '"';
		$data 	.= '}';
		$data 	.= '}$$';
		//get db credentials
		$layerInfo = $this->_getLayerInfo(null);
		$retorno = array();
		$logData['schema']		= $layerInfo['schema'];

		/*
      SELECT ws_sample32.gw_fct_deletefeaturefile($${
      		"client":{"device":9, "infoType":100, "lang":"ES"},
      		"form":{},
      		"feature":{"id":1101},
      		"data":{"file_id":10}}$$)
       */
		$query 						= "SELECT SCHEMA.gw_fct_deletefeaturefile(" . $data . ") AS result";
		$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
		$docs							= $this->_doQuery(null, $query, $layerInfo, $logData, null, $expected_api_version);
		$logData					= $this->_prepareLog($logData, $query, $docs, $startTime);
		if ($docs['status'] === "Accepted") {
			$res 			= $docs['message'];
			//store log
			$this->_log($logData['evt'], "deleteFeatureFile success", "OK", $logData);
			return array("status" => "Accepted", "message" => $res, "code" => 200);
		} else {
			//store log
			$this->_log($logData['evt'], "deleteFeatureFile failed - query error", "KO", $logData);
			return array("status" => "Failed", "message" => $docs, "code" => 501);
		}
		/* }catch(Exception $e){
      //****** Error
      $layerInfo['pwd_db_view']		= "*****";
      $layerInfo['pwd_db_edit']		= "*****";
      $logData["layerInfo"]				= $layerInfo;
      $logData['Exception'] 			= $e->getMessage();
      $logData['ExceptionLine'] 	= $e->getLine();
      $this->_log("GET INFO VISITS","setfeaturefile failed","KO",$logData);
      return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>402);
    }*/
	}



	/***
		method getInfoVisits

			@param $device <int>
			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@param $opt_array <array> Array with filter options [visit_start], [visit_end], [parameter_type], [parameter_id]

			@return JSON

	 ***/

	public function getInfoVisits($device, $pol_id, $id_name, $opt_array, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"opt_array"							=> $opt_array,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getInfoVisits"
			);
			//get db credentials
			$layerInfo				= $this->_getLayerInfo(null);
			$retorno 					= array();
			$logData['schema']		= $layerInfo['schema'];
			//filter options
			$opt_visit_start 			= null;
			$opt_visit_end 				= null;
			$opt_parameter_type 	= "NULL";
			$opt_parameter_id 		= "NULL";
			$opt_visit_id 				= "NULL";

			if ($opt_array != null) {
				if (array_key_exists('visit_start', $opt_array) && $opt_array['visit_start'] != null) {
					$opt_visit_start = $opt_array['visit_start'];
				}
				if (array_key_exists('visit_end', $opt_array) && $opt_array['visit_end'] != null) {
					$opt_visit_end 	= $opt_array['visit_end'];
				}
				if (array_key_exists('parameter_type', $opt_array) && $opt_array['parameter_type'] != null) {
					$opt_parameter_type 	= "'" . $opt_array['parameter_type'] . "'";
				}
				if (array_key_exists('parameter_id', $opt_array) && $opt_array['parameter_id'] != null) {
					$opt_parameter_id 	= "'" . $opt_array['parameter_id'] . "'";
				}

				if (array_key_exists('visit_id', $opt_array) && $opt_array['visit_id'] != null) {
					$opt_visit_id 	= $opt_array['visit_id'];
				}
			}

			$query 						= "SELECT SCHEMA.gw_fct_getinfovisits('" . $this->_clean_id_name($id_name) . "', '" . $pol_id . "', " . $device . ",'" . $opt_visit_start . "','" . $opt_visit_end . "'," . $opt_parameter_type . "," . $opt_parameter_id . "," . $opt_visit_id . ") AS result";
			$query 						= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs							= $this->_doQuery(null, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData					= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				//store log
				$this->_log($logData['evt'], "getInfoVisits success", "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				//store log
				$this->_log($logData['evt'], "getInfoVisits failed - query error", "KO", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error
			$layerInfo['pwd_db_view']		= "*****";
			$layerInfo['pwd_db_edit']		= "*****";
			$logData["layerInfo"]				= $layerInfo;
			$logData['Exception'] 			= $e->getMessage();
			$logData['ExceptionLine'] 	= $e->getLine();
			$this->_log("getInfoVisits", "getInfoVisits failed", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "query" => $query, "code" => 402);
		}
	}

	/***
		method getInfoDocs
			gets docs from an feature

			@param $device <int> 1 - mobile, 2- tablet, 3- desktop
			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <string> identifier from clicked element
			@param $id_name <string> name of the id field of the table/view to query
			@param $layerInfo <JSON> db credentials

			@return JSON

	 ***/

	public function getInfoConnect($device, $layer, $pol_id, $id_name, $layerInfo = null, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"method"								=> "getInfoConnect",
				"evt"										=> "getInfoConnect",
				"expected_api_version"	=> $expected_api_version,
			);
			$layerInfo		= $this->_getLayerInfo(null);

			$logData['schema']				= $layerInfo['schema'];
			$retorno 	= array();
			$query 		= "SELECT SCHEMA.gw_fct_getinfoconnects('" . $this->_clean_id_name($id_name) . "', '" . $pol_id . "', " . $device . ") AS result";
			$query 		= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs			= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData	= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				//print_r($res);
				if ($res) {
					if (array_key_exists('upstream', $res)) {
						$retorno['upstream'] = array();
						if (count($res['upstream']) > 0) {
							foreach ($res['upstream'] as $row) {
								array_push($retorno['upstream'], $row);
							}
						}
					}
					if (array_key_exists('downstream', $res)) {
						$retorno['downstream'] = array();
						if (count($res['downstream']) > 0) {
							foreach ($res['downstream'] as $row) {
								array_push($retorno['downstream'], $row);
							}
						}
					}
					if (array_key_exists('downstream_label', $res)) {
						$retorno['downstream_label'] = $res['downstream_label'];
					}
					if (array_key_exists('upstream_label', $res)) {
						$retorno['upstream_label'] = $res['upstream_label'];
					}
					if (array_key_exists('table', $res)) {
						$retorno['table'] = array();
						if (count($res['table']) > 0) {
							foreach ($res['table'] as $row) {
								array_push($retorno['table'], $row);
							}
						}
					}
					if (array_key_exists('node1', $res)) {
						$retorno['node1'] = array();
						if (count($res['node1']) > 0) {
							array_push($retorno['node1'], $res['node1']);
						}
					}
					if (array_key_exists('node2', $res)) {
						$retorno['node2'] = array();
						if (count($res['node2']) > 0) {
							array_push($retorno['node2'], $res['node2']);
						}
					}
				}
				$this->_log("getInfoConnect", "connect obtained for " . $layer, "OK", $logData);
				return array("status" => "Accepted", "message" => $retorno, "code" => 200);
			} else {
				$layerInfo['pwd_db_view']		= "*****";
				$layerInfo['pwd_db_edit']		= "*****";
				$logData["layerInfo"]				= $layerInfo;
				$logData['query'] 					= $query;
				$this->_log("getInfoConnect", "connect failed for " . $layer, "OK", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error in query
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("getInfoConnect", "Error in getInfoConnect", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}

	/***
		method getInfoElements
			gets elements from an feature

			@param $device <int> 1 - mobile, 2- tablet, 3- desktop
			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <string> identifier from clicked element
			@param $id_name <string> name of the id field of the table/view to query
			@param $layerInfo <JSON> db credentials

			@return JSON

	 ***/

	public function getInfoElements($device, $layer, $pol_id, $id_name, $layerInfo, $tabName, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"tabName"								=> $tabName,
				"method"								=> "getInfoElements",
				"evt"										=> "getInfoElements",
				"expected_api_version"	=> $expected_api_version,
			);
			$logData['schema']	= $layerInfo['schema'];
			$retorno 	= array();
			/*
				gw_fct_getinfoelements(idname character varying,   tabname character varying,  id character varying,  device integer)
			*/
			$query 		= "SELECT SCHEMA.gw_fct_getinfoelements('" . $this->_clean_id_name($id_name) . "','" . $tabName . "', '" . $pol_id . "', " . $device . ") AS result";
			$query 		= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs			= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData	= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				if (is_array($res['elements'])) {
					if (count($res['elements']) > 0) {
						foreach ($res['elements'] as $row) {
							array_push($retorno, $row);
						}
					}
				}
				//store log
				$this->_log("getInfoElements", "gw_fct_getinfoelements obtained for " . $layer, "OK", $logData);
				//end store log
				return array("status" => "Accepted", "message" => $retorno, "code" => 200);
			} else {
				$layerInfo['pwd_db_view']		= "*****";
				$layerInfo['pwd_db_edit']		= "*****";
				$logData["layerInfo"]				= $layerInfo;
				$logData['query'] 					= $query;
				$this->_log("getInfoElements", "gw_fct_getinfoelements failed for " . $layer, "OK", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error in query
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("getInfoElements", "Error in getInfoElements", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}

	/***
		method getInfoDocs
			gets docs from an feature

			@param $device <int> 1 - mobile, 2- tablet, 3- desktop
			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <string> identifier from clicked element
			@param $id_name <string> name of the id field of the table/view to query
			@param $layerInfo <JSON> db credentials

			@return JSON

	 ***/

	public function getInfoDocs($device, $layer, $pol_id, $id_name, $layerInfo, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"layerInfo"							=> $layerInfo,
				"expected_api_version"	=> $expected_api_version,
				"method"								=> "getInfoDocs",
				"evt"										=> "getInfoDocs"
			);
			$logData['schema']	= $layerInfo['schema'];
			$retorno 	= array();
			$query 		= "SELECT SCHEMA.gw_fct_getinfodocs('" . $this->_clean_id_name($id_name) . "', '" . $pol_id . "', " . $device . ") AS result";
			$query 		= $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
			$docs			= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData	= $this->_prepareLog($logData, $query, $docs, $startTime);
			if ($docs['status'] === "Accepted") {
				$res 			= $docs['message'];
				if (is_array($res['docs'])) {
					if (count($res['docs']) > 0) {
						foreach ($res['docs'] as $row) {
							array_push($retorno, $row);
						}
					}
				}
				//store log
				$this->_log("getInfoDocs", "docs obtained for " . $layer, "OK", $logData);
				//end store log
				return array("status" => "Accepted", "message" => $retorno, "code" => 200);
			} else {
				$this->_log("getInfoDocs", "docs failed", "KO", $logData);
				return array("status" => "Failed", "message" => $docs, "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error in query
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("getInfoDocs", "Error in getInfoDocs", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}
	//****************************************************************
	//*******************     END PG FUNCTIONS  **********************
	//****************************************************************

	//****************************************************************
	//************             GET INFO FORM         *****************
	//****************************************************************

	/***
		method getInfoFormFromId (former getInfoFormAndTabs)
			gets form for a info from a given id

			@param $layer <string> layer name for obtaining db credentials
			@param $db_table <string> db table name
			@param $id_name <string> element type (node, gully, arc or connec)
			@param $pol_id <string> element id
			@param $edit <Boolean>
			@param $device <integer>
			@param $info_type <integer>
			@param $expected_api_version <string>

			@return JSON

	 ***/

	public function getInfoFormFromId($layer, $db_table, $id_name, $pol_id, $edit, $device, $info_type, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"db_table"							=> $db_table,
				"device"								=> $device,
				"pol_id"								=> $pol_id,
				"edit"									=> $edit,
				"id_name"								=> $id_name,
				"info_type"							=> $info_type,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getInfoFormFromId"
			);
			if ($edit) {
				$editable = "TRUE";
			} else {
				$editable = "FALSE";
			}
			/*
			gw_fct_getinfofromid(id_name varchar, database_table_name varchar, id character varying,editable boolean, device integer, info_type integer, lang varchar)
			SELECT ud30.gw_fct_getinfofromid('arc', 'review_arc',1234, TRUE, 3, 'es') AS result;
			*/
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			$logData['schema']	= $layerInfo['schema'];
			$query  						=	"SELECT SCHEMA.gw_fct_getinfofromid('" . $this->_clean_id_name($id_name) . "','" . $db_table . "','" . $pol_id . "'," . $editable . "," . $device . "," . $info_type . ",'" . $_SESSION['lang'] . "') AS result";
			$formType						= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData						= $this->_prepareLog($logData, $query, $formType, $startTime);
			if ($formType['status'] === "Accepted") {
				$res 				= $formType['message'];
				$this->_log("getInfoFormFromId", "getInfoFormFromId obtained for " . $this->_clean_id_name($id_name), "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				$this->_log($logData['evt'], "Error in getInfoFormFromId", "KO", $logData);
				return array("status" => "Failed", "message" => $logData["result"], "code" => 501);
			}
		} catch (Exception $e) {
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getInfoFormFromId", "Error in getInfoFormFromId", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage() . " " . $e->getLine(), "code" => 501);
		}
	}

	/***
		method getInfoFromCoordinates
			gets form for a given coordinates

			@param $x <double precision>
			@param $y <double precision>
			@param $active_layer <string>
			@param $visible_layer <string>
			@param $epsg <string> SRID
			@param $zoomlevel
			@param $edit <Boolean>
			@param $device <integer>
			@param $info_type <integer>
			@param $expected_api_version <string>

			@return JSON

	 ***/

	public function getInfoFromCoordinates($x, $y, $active_layer, $visible_layers, $editable_layers, $epsg, $zoomlevel, $device, $info_type, $use_tiled_background, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"x"											=> $x,
				"y"											=> $y,
				"active_layer"					=> $active_layer,
				"visible_layers"				=> $visible_layers,
				"editable_layers"				=> $editable_layers,
				"epsg"									=> $epsg,
				"zoomlevel"							=> $zoomlevel,
				"device"								=> $device,
				"info_type"							=> $info_type,
				"expected_api_version"	=> $expected_api_version,
				"use_tiled_background" 	=> $use_tiled_background,
				"evt"										=> "getInfoFromCoordinates"
			);

			$visible_layers_str 			= "{";
			if (is_array($visible_layers)) {
				if (count($visible_layers) > 0) {
					foreach ($visible_layers as $value) {
						$visible_layers_str .= '"' . $value . '",';
					}
				}
			}
			$visible_layers_str 			= rtrim($visible_layers_str, ",") . "}";

			$editable_layers_str 			= "{";
			if (is_array($editable_layers)) {
				if (count($editable_layers) > 0) {
					foreach ($editable_layers as $value) {
						$editable_layers_str .= '"' . $value . '",';
					}
				}
			}
			$editable_layers_str 			= rtrim($editable_layers_str, ",") . "}";
			if ($use_tiled_background) {
				$use_tiled_background = "True";
			} else {
				$use_tiled_background	= "False";
			}
			/*

			*/
			$epsg 							= explode(":", $epsg);
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			$logData['schema']	= $layerInfo['schema'];
			$query  						=	"SELECT SCHEMA.gw_fct_getinfofromcoordinates(" . $x . "," . $y . "," . $epsg[1] . ",'" . $active_layer . "','" . $visible_layers_str . "','" . $editable_layers_str . "'," . $use_tiled_background . "," . $zoomlevel . "," . $device . "," . $info_type . ",'" . $_SESSION['lang'] . "') AS result";
			$formType						= $this->_doQuery($active_layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData						= $this->_prepareLog($logData, $query, $formType, $startTime);
			if ($formType['status'] === "Accepted") {
				$res 				= $formType['message'];
				$this->_log("getInfoFromCoordinates", "getInfoFromCoordinates obtained for " . $x . "," . $y, "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				$this->_log($logData['evt'], "Error in getInfoFromCoordinates", "KO", $logData);
				return array("status" => "Failed", "message" => $logData["result"], "code" => 501);
			}
		} catch (Exception $e) {
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getInfoFromCoordinates", "Error in getInfoFromCoordinates", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage() . " " . $e->getLine(), "code" => 501);
		}
	}

	/***
		method getInfoFromPolygon
			gets form for a given polygon

			@param $polygon <string>
			@param $active_layer <string>
			@param $visible_layer <string>
			@param $epsg <string> SRID
			@param $zoomlevel
			@param $edit <Boolean>
			@param $device <integer>
			@param $info_type <integer>
			@param $expected_api_version <string>

			@return JSON

	 ***/

	public function getInfoFromPolygon($polygon, $active_layer, $visible_layers, $editable_layers, $epsg, $zoomlevel, $device, $info_type, $use_tiled_background, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"polygon"							=> json_decode($polygon),
				"active_layer"					=> $active_layer,
				"visible_layers"				=> $visible_layers,
				"editable_layers"				=> $editable_layers,
				"epsg"									=> $epsg,
				"zoomlevel"							=> $zoomlevel,
				"device"								=> $device,
				"info_type"							=> $info_type,
				"expected_api_version"	=> $expected_api_version,
				"use_tiled_background" 	=> $use_tiled_background,
				"evt"										=> "getInfoFromPolygon"
			);

			$visible_layers_str 			= "{";
			if (is_array($visible_layers)) {
				if (count($visible_layers) > 0) {
					foreach ($visible_layers as $value) {
						$visible_layers_str .= '"' . $value . '",';
					}
				}
			}
			$visible_layers_str 			= rtrim($visible_layers_str, ",") . "}";

			$editable_layers_str 			= "{";
			if (is_array($editable_layers)) {
				if (count($editable_layers) > 0) {
					foreach ($editable_layers as $value) {
						$editable_layers_str .= '"' . $value . '",';
					}
				}
			}
			$editable_layers_str 			= rtrim($editable_layers_str, ",") . "}";
			if ($use_tiled_background) {
				$use_tiled_background = "True";
			} else {
				$use_tiled_background	= "False";
			}

			$epsg 							= explode(":", $epsg);
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			$logData['schema']	= $layerInfo['schema'];
			$query  						=	"SELECT SCHEMA.gw_fct_getinfofrompolygon('" . $polygon . "'," . $epsg[1] . ",'" . $active_layer . "','" . $visible_layers_str . "','" . $editable_layers_str . "'," . $use_tiled_background . "," . $zoomlevel . "," . $device . "," . $info_type . ",'" . $_SESSION['lang'] . "') AS result";
			$formType						= $this->_doQuery($active_layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData						= $this->_prepareLog($logData, $query, $formType, $startTime);
			if ($formType['status'] === "Accepted") {
				$res 				= $formType['message'];
				$this->_log("getInfoFromPolygon", "getInfoFromPolygon obtained for " . $polygon, "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				$this->_log($logData['evt'], "Error in getInfoFromPolygon", "KO", $logData);
				return array("status" => "Failed", "message" => $logData["result"], "code" => 501);
			}
		} catch (Exception $e) {
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getInfoFromPolygon", "Error in getInfoFromPolygon", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage() . " " . $e->getLine(), "code" => 501);
		}
	}

	//****************************************************************
	//************           END  GET INFO FORM       ****************
	//****************************************************************

	//****************************************************************
	//**********************    GET WEB FORMS   **********************
	//****************************************************************

	/***
		method getWebForms
			gets info for forms. Querys to query_text for getting the query to perform

			@param $form <string> table or view to for query, f.e: om_visit_x_node (arc,connec,gully)
			@param $device <int> 1 - mobile, 2- tablet, 3- desktop
			@param $layer <string> layer name for obtaining db credentials
			@param $pol_id <string> identifier from clicked element
			@param $id_name <string> name of the id field of the table/view to query
			@param $options <JSON> filters for querys (key-value), parameter_id, parameter_type, visit_start and visit_end
			@param $tabName <string> tabName wich is doing the request
			@return JSON

	 ***/

	public function getWebForms($form, $device, $layer, $pol_id, $id_name, $options = null, $tabName, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"form"									=> $form,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"options"								=> $options,
				"tabName"								=> $tabName,
				"expected_api_version"	=> $expected_api_version,
			);
			//end log data
			$layerInfo					= $this->_getLayerInfo(null);
			$logData['schema']	= $layerInfo['schema'];
			$retorno 			= array();
			if (count($layerInfo) > 0) {
				if ($layerInfo['schema'] === NULL) {
					$this->_log("getWebForms", "Schema not defined for layer " . $layer, "KO", $logData);
					return array("status" => "Failed", "message" => "Schema not defined", "code" => 501);
				} else {
					if (strpos($form, 'doc') !== false) {
						return $this->getInfoDocs($device, $layer, $pol_id, $id_name, $layerInfo, $expected_api_version);
					} else if (strpos($form, 'element') !== false) {
						return $this->getInfoElements($device, $layer, $pol_id, $id_name, $layerInfo, $tabName, $expected_api_version);
					} else if (strpos($form, 'connection') !== false) {
						return $this->getInfoConnect($device, $layer, $pol_id, $id_name, null, $expected_api_version);
					} else {
						$logData['error'] = $form . " not implemented";
						$this->_log("getWebForms", "Error GET WEB FORMS - " . $form . " not implemented", "KO", $logData);
						return array("status" => "Failed", "message" => $form . " not implemented", "code" => 405);
					}
					/*
					TBR when safe


					if($form==="v_ui_doc_x_arc" || $form==="v_ui_doc_x_node" || $form==="v_ui_doc_x_gully" || $form==="v_ui_doc_x_connec" || $form==="v_ui_doc_x_workcat"){
						return $this->getInfoDocs($device,$layer,$pol_id,$id_name,$layerInfo,$expected_api_version);
					}else if($form==="v_ui_element_x_arc" || $form==="v_ui_element_x_node" || $form==="v_ui_element_x_gully"  || $form==="v_ui_element" || $form==="v_ui_element_x_connec" || $form==="v_ui_element_x_workcat"){
						return $this->getInfoElements($device,$layer,$pol_id,$id_name,$layerInfo,$expected_api_version);
					}else if($form==="v_ui_node_x_connection_downstream" || $form==="v_ui_node_x_connection_upstream" || $form==="v_ui_arc_x_connection"){
						return $this->getInfoConnect($device,$layer,$pol_id,$id_name,$layerInfo,$expected_api_version);
					}else{
						$logData['error'] = $form." not implemented";
						$this->_log("getWebForms","Error GET WEB FORMS - ".$form." not implemented","KO",$logData);
						return array("status"=>"Failed","message"=>$form." not implemented","code"=>405);
					}

					END TBR
					*/
				}
			} else {
				//****** Error obtaining layer info
				//store log
				$this->_log("getWebForms", "Error obtaining layer information", "KO", $logData);
				//end store log
				return array("status" => "Failed", "message" => "Error obtaining layer: " . $layer . " information", "code" => 405);
			}
		} catch (Exception $e) {
			//****** Error in query
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("getWebForms", "Error in GET WEB FORMS", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}

	//****************************************************************
	//******************    END GET WEB FORMS   **********************
	//****************************************************************

	/***
		method updateVisit
			Updates a visit

			@param $layer <string> layer name for obtaining db credentials
			@param $visit_id <int> unique ID for visit
			@param $key <string> db table field to update
			@param $key <string> value of the field to be updated
			@param $pol_id <int> feature id
			@param $id_name <string> name of the id field of the table/view to query
			@param $layerInfo <JSON> db credentials - optional
			@return JSON

	 ***/

	public function updateVisit($layer, $visit_id, $key, $value, $pol_id, $id_name, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			if ($key === "is_done") {
				if ($value != 1) {
					$value = 0;
				}
			}
			$logData 	= array(
				"layer"									=> $layer,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"visit_id"							=> $visit_id,
				"key"										=> $key,
				"value"									=> $value,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateVisit"
			);
			$layerInfo					= $this->_getLayerInfo(null);
			$logData['schema']	= $layerInfo['schema'];
			$query 		= "SELECT SCHEMA.gw_fct_updatevisit(" . $visit_id . ", '" . $key . "', '" . $value . "') as result";
			$visitID	= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData	= $this->_prepareLog($logData, $query, $visitID, $startTime);
			if ($visitID['status'] === "Accepted") {
				$res 			= $visitID['message'];
				$this->_log($logData['evt'], "update visit success", "OK", $logData);
				return array("status" => "Accepted", "message" => $visitID['message'], "code" => 200);
			} else {
				$this->_log($logData['evt'], "update visit failed", "KO", $logData);
				return $visitID;
			}
		} catch (Exception $e) {
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData["query"]					= $query;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("updateVisit", "Error in updateVisit", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}

	//****************************************************************
	//****************       END VISITS         **********************
	//****************************************************************

	//****************************************************************
	//****************        DELETE VISIT      **********************
	//****************************************************************

	/***
		method deleteVisit
			deletes a visit

			@param $visit_id <string> visit unique ID
			@param $layer <string> layer name for obtaining db credentials

			@return JSON

	 ***/

	public function deleteVisit($visit_id, $layer, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"layer"									=> $layer,
				"visit"									=> $visit_id,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "deleteVisit"
			);
			$layerInfo					= $this->_getLayerInfo(null);
			$logData['schema']	= $layerInfo['schema'];
			//remove photos from mongo
			require_once('class.photos.sewernet.php');
			$photoClass = new PhotosSewernet();
			$photos 		= $photoClass->getPhotos($visit_id, "visit", $layer, $layerInfo, $expected_api_version);
			if ($photos['status'] === "Accepted") {
				if (is_array($photos['message']['photos'])) {
					if (count($photos['message']['photos']) > 0) {
						foreach ($photos['message']['photos'] as $photo) {
							$this->removeImg(array("img_id" => $photo));
						}
					}
				}
			}
			$query							= "SELECT SCHEMA.gw_fct_deletevisit(" . $visit_id . ") as result";
			$deleteVisit				= $this->_doQuery($layer, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData						= $this->_prepareLog($logData, $query, $deleteVisit, $startTime);
			$logData["query"]		= $query;
			$logData["result"]	= $deleteVisit;
			if ($deleteVisit['status'] === "Accepted") {
				$res 			= $deleteVisit['message'];
				$this->_log($logData['evt'], "deleteVisit success", "OK", $logData);
				return array("status" => "Accepted", "message" => $deleteVisit['message'], "code" => 200);
			} else {
				$this->_log($logData['evt'], "deleteVisit error", "KO", $logData);
				return array("status" => "Accepted", "message" => $deleteVisit['message'], "code" => 501);
			}
		} catch (Exception $e) {
			//****** Error in query
			$layerInfo['pwd_db_view']	= "*****";
			$layerInfo['pwd_db_edit']	= "*****";
			$logData["layerInfo"]			= $layerInfo;
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$this->_log("deleteVisit", "Error in deleteVisit", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage(), "code" => 501);
		}
	}

	//****************************************************************
	//****************       END DELETE VISIT   **********************
	//****************************************************************

	//****************************************************************
	//************        SET FORM COORDINATES        ****************
	//****************************************************************

	/***
		method setFormCoordinates


			@param $pos_x <float>
			@param $pos_y <float>
			@param $zoom <float>
			@param $form_id <string>
			@param $device <int>
			@param $uniqueId <string> initially is a mincut_id

			@return JSON

	 ***/

	public function setFormCoordinates($pos_x, $pos_y, $zoom, $srid, $form_id, $device, $uniqueId, $expected_api_version)
	{
		try {
			$startTime = microtime(true);
			$logData 	= array(
				"pos_x"									=> $pos_x,
				"pos_y"									=> $pos_y,
				"zoom"									=> $zoom,
				"srid"									=> $srid,
				"form_id"								=> $form_id,
				"device"								=> $device,
				"uniqueId"							=> $uniqueId,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "setFormCoordinates"
			);
			$epsg 							= explode(":", $srid);
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			if ($pos_x === null) {
				$pos_x = 'NULL';
			} else {
				$pos_x = "'" . $pos_x . "'";
			}
			if ($pos_y === null) {
				$pos_y = 'NULL';
			} else {
				$pos_y = "'" . $pos_y . "'";
			}
			if ($uniqueId === null) {
				$uniqueId = 'NULL';
			} else {
				$uniqueId	= "'" . $uniqueId . "'";
			}
			/*
				gw_fct_setcoordinates( p_x double precision,   p_y double precision, p_epsg integer,  p_device integer,  p_zoom_ratio double precision,  mincut_id text,  p_form_id text)			*/

			$query  						=	"SELECT SCHEMA.gw_fct_setcoordinates(" . $pos_x . "," . $pos_y . ",'" . $epsg[1] . "'," . $device . ",'" . $zoom . "'," . $uniqueId . ",'" . $form_id . "') AS result";
			$response						= $this->_doQuery(null, $query, $layerInfo, $logData, null, $expected_api_version);
			$logData						= $this->_prepareLog($logData, $query, $response, $startTime);
			if ($response['status'] === "Accepted") {
				$res 				= $response['message'];
				$this->_log($logData['evt'], "setFormCoordinates()", "OK", $logData);
				return array("status" => "Accepted", "message" => $res, "code" => 200);
			} else {
				$this->_log($logData['evt'], "Error in setFormCoordinates", "KO", $logData);
				return array("status" => "Failed", "message" => $logData["result"], "code" => 501);
			}
		} catch (Exception $e) {
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("setFormCoordinates", "Error in setFormCoordinates", "KO", $logData);
			return array("status" => "Failed", "message" => $e->getMessage() . " " . $e->getLine(), "code" => 501);
		}
	}

	//****************************************************************
	//************      END SET FORM COORDINATES      ****************
	//****************************************************************

	//****************************************************************
	//****************          HELPERS         **********************
	//****************************************************************

	/***
		method _doQuery
			performs a query to DB

			@param $layer <string> layer name for obtaining db credentials
			@param $query <string> query to perform
			@param $layerInfo <JSON> db credentials
			@param $logData <JSON> data for logging
			@param $action <STRING> for manage return - optional

			@return JSON

	 ***/

	protected function _doQuery($layer, $query, $layerInfo, $logData, $action = false, $expected_api_version)
	{
		$retorno 			= array();
		if (count($layerInfo) > 0) {
			if ($layerInfo['schema'] === NULL) {
				$this->_log($logData['evt'], "Schema not defined for layer " . $layer, "KO", $logData);
				return array("status" => "Failed", "message" => "Schema not defined", "code" => 501);
			} else {
				$_conn		= $this->_pgConnect($layerInfo['db_host'], $layerInfo['db_name'], $layerInfo['user_db_edit'], $layerInfo['pwd_db_edit'], $layerInfo['db_port']);
				if ($_conn['status'] === "Accepted") {
					$dbconn	= $_conn['message'];
					try {
						$query = $this->_setSchemaNameInQuery($layerInfo['schema'], $query);
						$result = @pg_query($dbconn, $query);
						if (@pg_affected_rows($result) > 0) {
							$row 								= pg_fetch_row($result);
							$data 							= $row[0];
							$logData["query"]		= $query;
							$logData["result"]	= $row;
							$res = json_decode($data, true);

							if ($res['status'] === "Accepted") {
								unset($res['status']);
								return array("status" => "Accepted", "message" => $res, "code" => 200);
							} else {
								$this->_log($logData['evt'], "API error", "KO", $logData);
								return array("status" => $res['status'], "message" => $res, "code" => 424);
							}
						} else {
							$logData["query"]					= $query;
							$this->_log($logData['evt'], "No data found", "KO", $logData);
							return array("status" => "Accepted", "message" => array(), "code" => 404);
						}
					} catch (Exception $e) {
						//****** Error in query
						$layerInfo['pwd_db_view']	= "*****";
						$layerInfo['pwd_db_edit']	= "*****";
						$logData["layerInfo"]			= $layerInfo;
						$logData["query"]					= $query;
						$logData['pg_error'] 			= pg_last_error($dbconn);
						$logData['Exception'] 		= $e->getMessage();
						$logData['ExceptionLine'] = $e->getLine();
						$this->_log($logData['evt'], "Error in query", "KO", $logData);
						return array("status" => "Failed", "message" => $e->getMessage(), "query" => $query, "code" => 402);
					}
				} else {
					$this->_log($logData['evt'], "Error connecting database", "KO", $logData);
					return array("status" => "Failed", "message" => "Error connecting database", "code" => 404);
				}
			}
		} else {
			$this->_log($logData['evt'], "Error obtaining layer information", "KO", $logData);
			return array("status" => "Failed", "message" => "Error obtaining layer: " . $layer . " information", "code" => 405);
		}
	}

	/***
		method _getTableForVisitX
			returns table name based on table id name

			@param $id_name <string> visit unique ID

			@return $table <string>

	 ***/

	protected function _getTableForVisitX($id_name)
	{
		if ($id_name === "arc_id") {
			$table 	= "om_visit_x_arc";
		} else if ($id_name === "connec_id") {
			$table 	= "om_visit_x_connect";
		} else if ($id_name === "gully_id") {
			$table 	= "om_visit_x_gully";
		} else {
			$table 	= "om_visit_x_node";
		}
		return $table;
	}

	/***
		method _setSchemaNameInQuery
			replaces 'SCHEMA' on the given query for the right db schema

			@param $schema <string> real db schema
			@param $query <string> query with fake "SCHEMA" for replace

			@return $query <string>

	 ***/

	protected function _setSchemaNameInQuery($schema, $query)
	{
		return str_replace("SCHEMA", $schema, $query);
	}

	/***
		method _clean_id_name
			returns name for pg functions based on id name.
			ex: node_id, will return "node", "arc_id" will return "arc"

			@param $id_name <string> field id name on db
			@return $realName <string>

	 ***/

	protected function _clean_id_name($id_name)
	{
		$realName = explode("_", $id_name);
		return $realName[0];
	}

	protected function _log($evt, $msg, $status, $logData)
	{
		$logData["user_id"]	= $_SESSION['user_id'];
		$logData["user"]		= $_SESSION['user_email'];
		$logData["evt"]			= $evt;
		$logData["msg"]			= $msg;
		$logData["status"]	= $status;
		$logData["source"]	= __FILE__;
		Logger::storeAccess($logData);
	}

	protected function _prepareLog($logData, $query, $result, $startTime)
	{
		$logData['query'] 			= $query;
		$logData['result'] 			= $result;
		$logData['initRequest']	= $startTime;
		$logData['endRequest']	= microtime(true);
		$logData['totalTime']		= microtime(true) - $logData['initRequest'];
		return $logData;
	}

	//****************************************************************
	//****************         END HELPERS      **********************
	//****************************************************************
}
