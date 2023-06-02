<?php
require_once('class.projects.sewernet.php');
class MultiUpdate extends ProjectsSewernet {
	protected $_system;

	/***
		method getmultiupdate
			gets getmultiupdate form

			@param $ids <array>
			@param $device <int>
			@param $info_type <int>
			@param $db_table <string>

			@return JSON

	***/

	public function getmultiupdate($ids,$device,$info_type,$db_table){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"device" => $device,
        "info_type"	=> $info_type,
				"db_table" 	=> $db_table,
        "ids" => $ids,
				"evt" => "GET MULTIUPDATE"
			);


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
      SELECT ws_sample3.gw_fct_getmultiupdate($${
      "client":{"device":4, "infoType":1, "lang":"ES"},
      "form":{},
      "feature":{"tableName":"v_edit_node", "ids":[1001, 1002, 1003]},
      "data":{}}$$)
       */


			$data = '$${';
			$data .='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
      $data .= '"form":{},';
			$data .='"feature":{"tableName":"'.$db_table.'","ids":['.implode(",", $ids).']},';
			$data .='"data":{}';
			$data 	.='}';
			$data 	.='$$';

			$query =	"SELECT SCHEMA.gw_fct_getmultiupdate(".$data.") AS result";
			$response	= $this->_doQuery(null,$query,$layerInfo,$logData,null,null);
			$logData = $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res = $response['message'];
				$this->_log("GET MULTIUPDATE","gw_fct_getmultiupdate","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gw_fct_getmultiupdate","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("GET MULTIUPDATE","Error in gw_fct_getmultiupdate","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	/***
		method setmultiupdate
			gets getmultiupdate form

			@param $ids <array>
			@param $device <int>
			@param $info_type <int>
			@param $db_table <string>

			@return JSON

	***/

	public function setmultiupdate($ids,$idName,$device,$info_type,$db_table,$formData){
		try{
			$startTime = microtime(true);
			$logData = array(
				"device" => $device,
				"info_type" => $info_type,
				"idName" => $idName,
				"db_table" => $db_table,
				"ids" => $ids,
				"formData" => $formData,
				"evt" => "SET MULTIUPDATE"
			);
      if($formData){
        $fdata = json_encode($formData);
        //$fdata = $sub."$$";
      }else{
        $fdata = '"NULL"';
      }
			$layerInfo = $this->_getLayerInfo(null); //null will use postgres current user
			/*
			SELECT "ws_sample3".gw_fct_setmultipudate(
			$${
			"client":{"device":3, "infoType":100, "lang":"ES"},
			"feature":{"featureType":"info", "tableName":"v_edit_node", "idName":"id", "selectedIds":[1000, 1001, 1002]},
			"data":{"fields":{"state":1, "observ":"Observacio test", "lant_date":"2000-04-01 00:00:00"},
			"deviceTrace":{}}}$$)
			*/

			$data = '$${';
			$data .='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
			$data .= '"form":{},';
			$data .='"feature":{"featureType":"info","tableName":"'.$db_table.'","idName":"'.$idName.'","selectedIds":['.implode(",", $ids).']},';
			$data .='"data":{"fields":'.$fdata.',';
			$data .='"deviceTrace":{}';
			$data 	.='}}';
			$data 	.='$$';

			$query =	"SELECT SCHEMA.gw_fct_setmultipudate(".$data.") AS result";
			$response	= $this->_doQuery(null,$query,$layerInfo,$logData,null,null);
			$logData = $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res = $response['message'];
				$this->_log("SET MULTIUPDATE","gw_fct_setmultipudate","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gw_fct_setmultipudate","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("SET MULTIUPDATE","Error in gw_fct_setmultipudate","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}
}
?>
