<?php
require_once('class.projects.sewernet.php');
class Table extends ProjectsSewernet {
	protected $_system;


	public function getTable($project_id,$db_table,$offset,$limit,$field,$value,$order,$sort,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"project_id"								=> $project_id,
				"db_table" 	=> $db_table,
        "offset" => $offset,
        "limit" => $limit,
				"field" => $field,
				"value" => $value,
        "order" => $order,
				"sort" => $sort,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getTable"
			);
			$_SESSION['currentProject'] = $project_id;

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
      SELECT ws_sample32.gw_api_getlistweb($${"table_name":"arc","offset":0,"limit":5,"filter":{"arc_id":"%2%"},"orderBy":"arc_id","orderType":"DESC","lang":"ES"}$$);
      */
			$data 	= '$$';
			$data 	.='{';
			$data 		.='"table_name":"'.$db_table.'",';
			$data 		.='"offset":'.$offset.',"limit":'.$limit.',';
			if($field!=null && $value!=null){
				$data .= '"filter":{"'.$field.'":"%'.$value.'%"},';
			}
      if($order!=null){
        	$data .= '"orderBy":"'.$order.'","orderType":"'.$sort.'",';
      }
			$data 		.='"lang":"'.$_SESSION['lang'].'"';
			$data 	.='}';
			$data 	.='$$';

			$query =	"SELECT SCHEMA.gw_api_getlistweb(".$data.") AS result";
			$response	= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData = $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("getTable","getTable()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getTable","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getTable","Error in getTable","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}


}
