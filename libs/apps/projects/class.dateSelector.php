<?php
require_once('class.projects.sewernet.php');
class DateSelector extends ProjectsSewernet {
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

	public function getDatesForm($device,$use_tiled_background,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"device"								=> $device,
				"use_tiled_background" 	=> $use_tiled_background,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getDatesForm"
			);
			if($use_tiled_background){
				$use_tiled_background = "True";
			}else{
				$use_tiled_background	= "False";
			}

			$data = '{"istilemap":"'.$use_tiled_background.'","device":'.$device.',"lang":"'.$_SESSION['lang'].'"}';
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				select ws_sample.gw_fct_getfilterdate('{"istilemap":"False","device":9,"lang":"ca"}')
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_getfilterdate('".$data."') AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("getDatesForm","getDatesForm","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getDatesForm","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getDatesForm","Error in getDatesForm","KO",$logData);
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
