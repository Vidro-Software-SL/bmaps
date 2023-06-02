<?php
require_once('class.projects.sewernet.php');
class Filters extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************               GET FILTERS         *****************
	//****************************************************************

	/***
		method getFilters
			gets getFilters form

			@param $device <int>

			@return JSON

	***/

	public function getFilters($device,$use_tiled_background,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"device"								=> $device,
				"use_tiled_background" 	=> $use_tiled_background,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "getFilters"
			);
			if($use_tiled_background){
				$use_tiled_background = "True";
			}else{
				$use_tiled_background	= "False";
			}
			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				gw_fct_getfilters(device integer,lang string)
			*/

			$query  						=	"SELECT SCHEMA.gw_fct_getfilters(".$use_tiled_background.",".$device.",'".$_SESSION['lang']."') AS result";
			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log("getFilters","getFilters()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in getFilters","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("getFilters","Error in getFilters","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************            END GET FILTERS         ****************
	//****************************************************************


	//****************************************************************
	//************            UPDATE FILTERS          ****************
	//****************************************************************

	/***
		method updateFilters
			Updates filters


			@param $key <string> db table field to update
			@param $value <string> value of the field to be updated
			@param $tabLabel <string> filter name (exploitation or state)
			@param $tabName <string> filter i (expl_id or state)

			@return JSON

	***/

	public function updateFilters($key,$value,$tabName,$tabIdName,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"key"										=> $key,
				"value"									=> $value,
				"tabIdName"							=> $tabIdName,
				"tabName"								=> $tabName,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "updateFilters"
			);
			$layerInfo			= $this->_getLayerInfo(null); //null will use postgres current user
			/*
				gw_fct_setfilters(name integer, status boolean, tabName varchar, tabIdName varchar)
			*/
			$query 							= "SELECT SCHEMA.gw_fct_setfilters(".$key.", '".$value."','".$tabName."','".$tabIdName."') as result";
			$event							= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$event,$startTime);
			if($event['status']==="Accepted"){
				$res 				= $event['message'];
				$this->_log($logData['evt'],"updateFilters success","OK",$logData);
				return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
			}else{
				$this->_log($logData['evt'],"updateFilters failed","KO",$logData);
				return $event;
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("updateFilters","Error in updateFilters","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
		}
	}
	//****************************************************************
	//************         END UPDATE ALL FILTERS     ****************
	//****************************************************************

  /***
    method updateAllFilters
      Updates filters


      @param $fields <string> string with JSON
			@param $tabName <string>
			@param $tabIdName <string>

      @return JSON

  ***/

  public function updateAllFilters($fields,$tabName,$tabIdName,$expected_api_version){
    try{
      $startTime = microtime(true);
      $logData 	= array(
        "fields"								=> $fields,
				"tabIdName"							=> $tabIdName,
				"tabName"								=> $tabName,
        "expected_api_version"	=> $expected_api_version,
        "evt"										=> "updateAllFilters"
      );
      $layerInfo			= $this->_getLayerInfo(null); //null will use postgres current user
      /*
        gw_fct_setAllfilters(fields varchar, tabName varchar, tabIdName varchar)
      */
      $query 							= "SELECT SCHEMA.gw_fct_setAllfilters('".$fields."','".$tabName."','".$tabIdName."') as result";
      $event							= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
      $logData						= $this->_prepareLog($logData,$query,$event,$startTime);
      if($event['status']==="Accepted"){
        $res 				= $event['message'];
        $this->_log($logData['evt'],"updateAllFilters success","OK",$logData);
        return array("status"=>"Accepted","message"=>$event['message'],"code"=>200);
      }else{
        $this->_log($logData['evt'],"updateAllFilters failed","KO",$logData);
        return $event;
      }
    }catch(Exception $e){
      $logData['Exception'] 		= $e->getMessage();
      $logData['ExceptionLine'] = $e->getLine();
      $logData['ExceptionFile'] = $e->getFile();
      $this->_log("updateAllFilters","Error in updateAllFilters","KO",$logData);
      return array("status"=>"Failed","message"=>$e->getMessage(),"code"=>501);
    }
  }
  //****************************************************************
  //************         END UPDATE ALL FILTERS     ****************
  //****************************************************************
}
?>
