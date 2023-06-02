<?php
require_once('class.projects.sewernet.php');
class Search extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************               GET SEARCH          *****************
	//****************************************************************

	/***
		method getSearch
			gets getSearch form

			@param $device <int>

			@return JSON

	***/

	public function getSearch($device, $info_type,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"device" => $device,
				"info_type" => $info_type,
				"expected_api_version"	=> $expected_api_version,
				"evt" => "getSearch"
			);

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				SELECT ws_sample.gw_fct_getsearch(1,'ES',0) AS result;
				FUNCTION ws_sample.gw_fct_getsearch(device integer, lang varchar, info_type integer)
			*/

			$query ="SELECT SCHEMA.gw_fct_getsearch(".$device.",'".$_SESSION['lang']."',".$info_type.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("getExploitation","getSearch()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getSearch","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getSearch","Error in getSearch","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************             END GET SEACRH         ****************
	//****************************************************************

	//****************************************************************
	//************              UPDATE SEARCH         ****************
	//****************************************************************

	/***
		method updateSearch
			Updates search


			@param $searchData <array> array with fields for update

			@return JSON

	***/

	public function updateSearch($searchData,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"searchData"						=> $searchData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateSearch"
			);
			$layerInfo			= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				SELECT ws_sample.gw_fct_updatesearch('{"tabName":"network","type":{"value":"v_edit_arc","name":"arc"},"code":{"text":"11"}}') AS result;
			*/

			//    !!! we use $$ before and after JSON for avoid problems with simple quotes '
			$query  						=	"SELECT SCHEMA.gw_fct_updatesearch($$".substr($searchData, 1, -1)."$$) AS result";
			$event							= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"updateSearch success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"updateSearch failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateSearch","Error in updateSearch","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}
	//****************************************************************
	//************          END UPDATE SEARCH         ****************
	//****************************************************************

	//****************************************************************
	//*********            UPDATE SEARCH ADD          ****************
	//****************************************************************

	/***
		method updateSearchAdd
			Updates search


			@param $searchData <array> array with fields for update

			@return JSON

	***/

	public function updateSearchAdd($searchData,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"searchData"						=> $searchData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateSearchAdd"
			);
			$layerInfo			= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				`SELECT ws_sample.gw_fct_updatesearch_add('{"tabName":"adress","add_muni":{"id":1,"name":"Sant Boi del Llobregat"},"add_street":{"id":"1-10100C", "name":"Calle Legalitat"}, "add_postnumber": "33"}')`
			}
			*/

			//    !!! we use $$ before and after JSON for avoid problems with simple quotes '
			$query  						=	"SELECT SCHEMA.gw_fct_updatesearch_add($$".substr($searchData, 1, -1)."$$) AS result";
			$event							= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"updateSearch success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"updateSearch failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateSearchAdd","Error in updateSearchAdd","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}
	//****************************************************************
	//************        END UPDATE SEARCH ADD        ***************
	//****************************************************************
}
