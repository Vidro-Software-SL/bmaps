<?php
require_once('class.projects.sewernet.php');
class Mincut extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************               UPSERT MINCUT       *****************
	//****************************************************************

	/***
		method upsertMincut

			@param $mincut_id <string>
			@param $x <float>
			@param $y <int>
			@param $srid <string>
			@param $device <int>
			@param $id_name <string>
			@param $pol_ids <array>
			@param $data <JSON>

			@return JSON

	***/

	public function upsertMincut($mincut_id,$x,$y,$srid,$device,$id_name,$pol_id,$formData,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"mincut_id"							=> $mincut_id,
				"x"											=> $x,
				"y"											=> $y,
				"srid"									=> $srid,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"pol_ids"								=> json_encode($pol_id),
				"data"									=> json_encode($formData),
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "upsertMincut"
			);
			if($mincut_id===NULL){
				$mincut_id = 'NULL';
			}
			if($x===NULL){
				$x = 'NULL';
			}
			if($y===NULL){
				$y = 'NULL';
			}
			if($formData){
				$sub = json_encode($formData);
				$data = "$$".$sub."$$";
			}else{
				$data = 'NULL';
			}
			//if has only one pol_id or pol_is a string, use pol_id as string
			$pol_ids = $pol_id;
			if(is_array($pol_id)){
				//if has more than one pol_id, json_encode array or pol_id's
				if(count($pol_id)>1){
					$pol_ids = json_encode($pol_id);
				}else{
						$pol_ids = $pol_id[0];
				}
			};
			$srid 							= explode(":", $srid);
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			FUNCTION ws_sample.gw_fct_upsertmincut(mincut_id character varying, x double precision, y double precision, srid_arg integer, device integer, insert_data json, element_type character varying, id character varying)

			SELECT ws_sample.gw_fct_upsertmincut(NULL, 419208.17495422, 4576589.8852483, 25831, 3, '$${"work_order":"","mincut_state":2,"mincut_type":"Demo","anl_cause":"Accidental","assigned_to":999,"anl_tstamp":"2018-07-27 15:41:07.944289+02","forecast_start":null,"forecast_end":null,"anl_descript":"","exec_start":null,"exec_descript":"","exec_end":null,"muni_id":"Sant Boi del Llobregat","postcode":"08830","postnumber":"2","streetaxis_id":"Calle de Salvador Seguí"}$$', 'arc', '20851') AS result;
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_upsertmincut(".$mincut_id.",".$x.",".$y.",".$srid[1].",".$device.",".$data.",'".$this->_clean_id_name($id_name)."','".$pol_ids."') AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("UPSERT MINCUT","upsertMincut()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in upsertMincut","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("upsertMincut","Error in upsertMincut","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************          END UPSERT MINCUT         ****************
	//****************************************************************

	//****************************************************************
	//************            GET INFO MINCUT         ****************
	//****************************************************************

	/***
		method getInfoMincut


			@param $layer <string>
			@param $pol_id <string>
			@param $fromDate <int> timestamp
			@param $toDate <int> timestamp
			@param $device <int>
			@param $expected_api_version <string>

			@return JSON

	***/

	public function getInfoMincut($id_name,$pol_id,$fromDate,$toDate,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"fromDate"							=> $fromDate,
				"toDate"								=> $toDate,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getInfoMincut"
			);

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			SELECT ws_sample.gw_fct_getinfomincut('arc', '2076', NULL, NULL, 3) AS result;

			gw_fct_getinfomincut(element_type character varying, id character varying, start timestamp, end timestamp, device integer)

			*/
			$query  						=	"SELECT SCHEMA.gw_fct_getinfomincut('".$this->_clean_id_name($id_name)."','".$pol_id."','".$fromDate."','".$toDate."',".$device.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"getInfoMincut()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getInfoMincut","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getInfoMincut","Error in getInfoMincut","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************         END GET INFO MINCUT         ***************
	//****************************************************************

	//****************************************************************
	//************          GET SINGLE MINCUT         ****************
	//****************************************************************

	/***
		method getMincut
			Gets a single mincut form

			@param $mincut_id_arg <int>
			@param $device <int>

			@return JSON

	***/

	public function getMincut($x,$y,$epsg,$mincut_id_arg,$device,$id_name,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"x"											=> $x,
				"y"											=> $y,
				"epsg"									=> $epsg,
				"mincut_id_arg"					=> $mincut_id_arg,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getMincut"
			);
			$epsg 						= explode(":", $epsg);
			//if $mincut_id_arg is null, set string 'NULL' for query
			if($mincut_id_arg===null){
				$mincut_id_arg = 'NULL';
			}
			if($x===null){
				$x = 'NULL';
			}
			if($y===null){
				$y = 'NULL';
			}
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			FUNCTION ws_sample.gw_fct_getmincut(x double precision, y double precision, srid_arg integer, mincut_id_arg integer, device integer, feauture type string, lang character varying)
				if `mincut_id` is `NULL` is because a new mincut, will return `default` values
				SELECT ws_sample.gw_fct_getmincut(419076.176909753, 4576665.99431834, '25831', NULL, 3, 'ES') AS result;
			*/
			$query  						=	"SELECT SCHEMA.gw_fct_getmincut(".$x.",".$y.",'".$epsg[1]."',".$mincut_id_arg.",".$device.",'".$this->_clean_id_name($id_name)."','".$_SESSION['lang']."') AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"getMincut()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getMincut","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getMincut","Error in getMincut","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************         END GET SINGLE MINCUT      ****************
	//****************************************************************

	//****************************************************************
	//************               GET MINCUTS          ****************
	//****************************************************************

	/***
		method getMincutManager
			Gets mincut manager

			@param $device <int>

			@return JSON

	***/

	public function getMincutManager($device,$formData,$expected_api_version){
	//	try{
			$startTime = microtime(true);
			$logData 	= array(
				"data"									=> json_encode($formData),
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getMincutManager"
			);
			if($formData){
				$sub = json_encode($formData);

				$data = "$$".$sub."$$";
			}else{
				$data = 'NULL';
			}

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				SELECT ws_sample.gw_fct_getmincuts(3, 'ES') AS result;

				El prototipo es:

				FUNCTION gw_fct_getmincuts(device integer, lang text)	*/

			$query  						=	"SELECT SCHEMA.gw_fct_getmincuts(".$data.",".$device.",'".$_SESSION['lang']."') AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"getMincutManager()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getMincutManager","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		/*}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("GET MINCUTS","Error in getMincutManager","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}*/
	}

	//****************************************************************
	//************             END GET MINCUTS        ****************
	//****************************************************************

	//****************************************************************
	//************            UPDATE MINCUTS          ****************
	//****************************************************************

	/***
		method updateMincutManager
			updates mincut manager

			@param $data <json>
			@param $device <int>

			@return JSON

	***/

	public function updateMincutManager($data,$tabName,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"data"									=> json_encode($data),
				"device"								=> $device,
				"tabName"								=> $tabName,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateMincutManager"
			);

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				FUNCTION ws_sample.gw_fct_updatemincuts(form_data json, tabName string device integer, lang text)
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_updatemincuts('".json_encode($data,JSON_FORCE_OBJECT)."','".$tabName."',".$device.",'".$_SESSION['lang']."') AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("updateMincutManager","updateMincutManager()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in updateMincutManager","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateMincutManager","Error in updateMincutManager","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************            END UPDATE MINCUTS      ****************
	//****************************************************************

	//****************************************************************
	//************            EXCLUDE MINCUTS         ****************
	//****************************************************************

	/***
		method excludeMincut
			excludeMincut a valve form mincut manager

			@param $valve_id <json>
			@param $mincut_id <int>

			@return JSON

	***/

	public function excludeFromMincut($valve_id,$mincut_id,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"valve_id"							=> $valve_id,
				"mincut_id"							=> $mincut_id,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "excludeFromMincut"
			);

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
					SELECT ws_sample.gw_fct_setvalveunaccess('valve_id', mincut_id)
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_setvalveunaccess('".$valve_id."',".$mincut_id.",".$device.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("excludeFromMincut","excludeFromMincut()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in excludeFromMincut","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("excludeFromMincut","Error in excludeFromMincut","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************            END EXCLUDE MINCUT      ****************
	//****************************************************************

	//****************************************************************
	//************                END MINCUT          ****************
	//****************************************************************

	/***
		method endMincut
			endMincut

			@param $mincut_id <int>
			@param $device <int>
			@param $id_name <string>
			@param $pol_id <string>
			@param $data <JSON>

			@return JSON

	***/

	public function endMincut($mincut_id,$device,$formData,$id_name,$pol_id,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"mincut_id"							=> $mincut_id,
				"device"								=> $device,
				"id_name"								=> $id_name,
				"pol_id"								=> $pol_id,
				"data"									=> json_encode($formData),
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "endMincut"
			);
			if($formData){
				$sub = json_encode($formData);
				$data = "$$".$sub."$$";
			}else{
				$data = 'NULL';
			}
			if($mincut_id===null){
				$mincut_id = 'NULL';
			}
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			gw_fct_setmincut_end(    p_mincut_id integer,    p_insert_data json,    p_element_type character varying,    p_id character varying,  p_device integer )

			*/

			$query  						=	"SELECT SCHEMA.gw_fct_setmincut_end(".$mincut_id.",".$data.",'".$this->_clean_id_name($id_name)."','".$pol_id."',".$device.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"endMincut()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in endMincut","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("endMincut","Error in endMincut","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************             END END MINCUT         ****************
	//****************************************************************

	//****************************************************************
	//************                START MINCUT        ****************
	//****************************************************************

	/***
		method startMincut
			endMincut

			@param $mincut_id <int>
			@param $device <int>

			@return JSON

	***/

	public function startMincut($mincut_id,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"mincut_id"							=> $mincut_id,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "startMincut"
			);
			if($mincut_id===null){
				$mincut_id = 'NULL';
			}
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			SELECT ws_sample.gw_fct_setmincut_start(    p_mincut_id integer,    p_device integer)
			el mincut_id i el device
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_setmincut_start(".$mincut_id.",".$device.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"startMincut()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in startMincut","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("startMincut","Error in startMincut","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************              END START MINCUT      ****************
	//****************************************************************

	//****************************************************************
	//*********            UPDATE MINCUT ADD          ****************
	//****************************************************************

	/***
		method updateMincutAdd
			Updates mincut manager, field exploitation


			@param $searchData <array> array with fields for update

			@return JSON

	***/

	public function updateMincutAdd($searchData,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"searchData"						=> $searchData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateMincutAdd"
			);
			$layerInfo			= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				`SELECT ws_sample.gw_fct_updatemincuts_add('{"tabName":"adress","add_muni":{"id":1,"name":"Sant Boi del Llobregat"},"add_street":{"id":"1-10100C", "name":"Calle Legalitat"}, "add_postnumber": "33"}')`
			}
			*/

			//    !!! we use $$ before and after JSON for avoid problems with simple quotes '
			$query  						=	"SELECT SCHEMA.gw_fct_updatemincuts_add($$".substr($searchData, 1, -1)."$$) AS result";
			$event							= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"updateSearch success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"updateMincutAdd failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateMincutAdd","Error in updateMincutAdd","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}
	//****************************************************************
	//************        END UPDATE MINCUT ADD        ***************
	//****************************************************************

}
?>
