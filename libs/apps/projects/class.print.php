<?php
require_once('class.projects.sewernet.php');
class PrintSewernet extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************               GET PRINT           *****************
	//****************************************************************

	/***
		method getPrint
			gets print form

			@param $composers <JSON>
			@param $device <int>
			@param $expected_api_version <string>

			@return JSON

	***/

	public function getPrint($composers,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"composers"							=> $composers,
				"device"								=> $device,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getPrint"
			);

			if($composers){
				$data = str_replace("[", "{", $composers);
				$data = str_replace("]", "}", $data);
			}

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*
			select ws_sample.gw_fct_getprint('{"mincutA4","mincutA3"}',3)
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_getprint('".$data."',".$device.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("getPrint","getPrint","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getPrint","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getPrint","Error in getPrint","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************              END GET PRINT         ****************
	//****************************************************************

	//****************************************************************
	//************            UDPATE PRINT           *****************
	//****************************************************************

	/***
		method updatePrint


			@param $formDatas <JSON>
			@param $device <int>
			@param $expected_api_version <string>

			@return JSON

	***/

	public function updatePrint($formData,$extent,$device,$use_tiled_background,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"formData"							=> $formData,
				"extent"								=> $extent,
				"device"								=> $device,
				"use_tiled_background"	=> $use_tiled_background,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updatePrint"
			);
			if($formData){
				$sub = json_encode($formData);
				$data = "$$".$sub."$$";
			}else{
				$data = 'NULL';
			}
			if($use_tiled_background){
				$use_tiled_background = "True";
			}else{
				$use_tiled_background	= "False";
			}
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*
			select ws_sample.gw_fct_updateprint( p_data json,  p_geom1 double precision,  p_geom2 double precision,  p_x double precision,  p_y double precision, p_device integer)
			*/
			$query  						=	"SELECT SCHEMA.gw_fct_updateprint(".$data.",".$extent.",".$use_tiled_background.",".$device.") AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"updatePrint()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in updatePrint","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updatePrint","Error in updatePrint","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************           END UPDATE PRINT         ****************
	//****************************************************************
}
?>
