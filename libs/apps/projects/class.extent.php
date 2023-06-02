<?php
require_once('class.projects.sewernet.php');
class Extent extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************       GET DATE SELECTOR FORM      *****************
	//****************************************************************

	/***
		method getDatesForm
			gets date selector form

			@param $device <int>

			@return JSON

	***/

	public function getExtent(){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"evt"										=> "getExtent"
			);
			$data = '$${}$$';
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				SELECT ws_sample3.gw_fct_getextent($${}$$);
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_getextent(".$data.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,"1.1.1");
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				if(array_key_exists('data',$res)){
						$this->_log("getExtent","getExtent","OK",$logData);
						return array("status"=>"Accepted","message"=>$res['data'],"code"=>200);
				}else{
					$this->_log($logData['evt'],"Error in getExtent no geometry","KO",$logData);
					return array("status"=>"Failed","message"=>$res,"code"=>501);
				}
			}else{
				$this->_log($logData['evt'],"Error in getExtent","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getDatesForm","Error in getExtent","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//***********     END GET DATE SELECTOR FORM      ****************
	//****************************************************************

	//****************************************************************
	//************           SET FILTER DATE         *****************
	//****************************************************************

	/***
		method setFilterDate


			@param $formDatas <JSON>
			@param $device <int>
			@param $expected_api_version <string>

			@return JSON

	***/

	public function setFilterDate($formData,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"formData"							=> $formData,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "setFilterDate"
			);
			$formData['lang'] 				= $_SESSION['lang'];
			$formData['device'] 			= $device;
			if($formData){
				$sub = json_encode($formData);
				$data = "'".$sub."'";
			}else{
				$data = 'NULL';
			}

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*
			gw_fct_setfilterdate('{"from_date":"2018-10-11","to_date":"2018-10-12", "device":9,"lang":"ca"}')
			*/
			$query  						=	"SELECT SCHEMA.gw_fct_setfilterdate(".$data.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("setFilterDate","setFilterDate()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in setFilterDate","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("setFilterDate","Error in setFilterDate","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************      END  SET FILTER DATE          ****************
	//****************************************************************

}
?>
