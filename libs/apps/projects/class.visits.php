<?php
require_once('class.projects.sewernet.php');
class Visits extends ProjectsSewernet {
	protected $_system;

	//****************************************************************
	//************                GET VISIT           ****************
	//****************************************************************

	/***
		method gwGetVisit
			Gets visits

			@param $device <int>
			@param $formData <JSON>

			@return JSON

	***/

	public function gwGetVisit($pol_id,$id_name,$visitType,$tableName,$visit_id,$info_type,$device,$formParameters,$formFeatureData,$formPagination,$formData,$extraData,$deviceTrace,$isOffline,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"visit_id"							=> $visit_id,
				"device"								=> $device,
				"visitType"							=> $visitType,
				"tableName"							=> $tableName,
				"formParameters"				=> $formParameters,
				"formFeatureData"				=> json_decode($formFeatureData),
				"formPagination"				=> json_decode($formPagination),
				"extraData"							=> json_decode($extraData),
				"deviceTrace"						=> json_decode($deviceTrace),
				"formData"							=> $formData,
        "isOffline"             => $isOffline,
				"info_type"							=> $info_type,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "gwGetVisit"
			);
			if($extraData=="null"){
				$extraData = null;
			}else{
				$extraData 	= substr($extraData, 1, -1);
			}
			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);
			//remove first { and last } from parameters e.g "form":{"tabData":{"active":true: }
			if($formParameters!="{}"){
				$form 	= substr($formParameters, 1, -1);
			}else{
				$form 	= '"form":'.$formParameters;
			}
			if($formFeatureData=="null"){
				$formFeatureData = null;
			}else{
				$formFeatureData = '"feature":'.$formFeatureData;
			}
			/*
				$formFeatureData	= '{"featureType":"visit", "visit_id":null}';
			}*/
			if(!$formPagination){
				$formPagination = 'null';
			}
			$data 	= '$${';
			$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
			if($formFeatureData){
				$data 	.= $formFeatureData.',';
			}
			$data 	.= $form.',';
			$data 	.='"data":{';
			if($isOffline){
				$data 	.= '"isOffline":"true",';
			}
			$data 	.='"relatedFeature":{"type":"'.$this->_clean_id_name($id_name).'", "id":"'.$pol_id.'", "tableName":"'.$tableName.'"},';
			$data 	.='"fields":'.json_encode($formData,JSON_FORCE_OBJECT);
			$data 	.=',"pageInfo":'.$formPagination;
			if($extraData){
				$data .= ','.$extraData;
			}
			$data 	.='}';
			$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*
			First call
  			gw_api_getvisit($${
							"client":{"device":3,"infoType":100,"lang":"es"},
							"form":{},
							"data":{
								"relatedFeature":{"type":"arc", "id":"2080"},
								"fields":{},
								"pageInfo":null}
						}$$)

        -- offline
        gw_apigetvisit($${
            "client":{"device":3,"infoType":100,"lang":"es"},
            "form":{},
            "data":{
              "isOffline":"true",
              "relatedFeature":{"type":"node", "tableName":"ve_node},
              "fields":{},
              "pageInfo":null}
            }$$)

        --insertfile action with insert visit (visit null or visit not existing yet on database)
				gw_api_getvisit($${
						"client":{"device":3, "infoType":100, "lang":"ES"},
						"feature":{"featureType":"visit","tableName":"ve_visit_arc_insp","idName":"visit_id", "id":null},
						"form":{"tabData":{"active":true}, "tabFiles":{"active":false}},
						"data":{
							"relatedFeature":{"type":"arc", "id":"2001"},
							"fields":{"class_id":"1","arc_id":"2001","visitcat_id":"1","desperfectes_arc":"2","neteja_arc":"3"},
							"pageInfo":{"orderBy":"tstamp", "orderType":"DESC", "currentPage":3},
							"newFile": {
									"fileFields":{"visit_id":null, "hash":"testhash", "url":"urltest", "filetype":"png"},
									"deviceTrace":{"xcoord":8597877, "ycoord":5346534, "compass":123}}}
				}$$)
			*/
			if($visitType==="incidence"){
				$query  						=	"SELECT SCHEMA.gw_api_getunexpected(".$data.") AS result";
			}else{
				$query  						=	"SELECT SCHEMA.gw_api_getvisit(".$data.") AS result";
			}

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwGetVisit()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"gwGetVisit()",$response['status'],$logData);
				return array("status"=>$response['status'],"message"=>$response['message'],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwGetVisit","Error in gwGetVisit","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	public function gwGetVisitChapuza($pol_id,$id_name,$visitType,$tableName,$visit_id,$info_type,$device,$formParameters,$formFeatureData,$formPagination,$formData,$extraData,$deviceTrace,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"visit_id"							=> $visit_id,
				"visitType"							=> $visitType,
				"tableName"							=> $tableName,
				"device"								=> $device,
				"formParameters"				=> $formParameters,
				"formFeatureData"				=> json_decode($formFeatureData),
				"formPagination"				=> json_decode($formPagination),
				"extraData"							=> json_decode($extraData),
				"deviceTrace"						=> json_decode($deviceTrace),
				"formData"							=> $formData,
				"info_type"							=> $info_type,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "gwGetVisit HARDCODED"
			);
			if($extraData=="null"){
				$extraData = null;
			}else{
				$extraData 	= substr($extraData, 1, -1);
			}
			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);
			//remove first { and last } from parameters e.g "form":{"tabData":{"active":true: }
			if($formParameters!="{}"){
				$form 	= substr($formParameters, 1, -1);
			}else{
				$form 	= '"form":'.$formParameters;
			}
			if($formFeatureData=="null"){
				$formFeatureData = null;
			}else{
				$formFeatureData = '"feature":'.$formFeatureData;
			}
			/*
				$formFeatureData	= '{"featureType":"visit", "visit_id":null}';
			}*/
			if(!$formPagination){
				$formPagination = 'null';
			}
			$data 	= '$${';
			$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
			$data 	.= '"feature":{"id":'.$visit_id.'},';
			$data 	.= '"form":{},';
			$data 	.='"data":{';
			$data 	.='"relatedFeature":{"type":"'.$this->_clean_id_name($id_name).'", "id":"'.$pol_id.'", "tableName":"'.$tableName.'"},';
			$data 	.='"fields":{}';
			$data 	.=',"pageInfo":null}';
			$data 	.='}$$';
			if($extraData){
				$data .= ','.$extraData;
			}

			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			`SELECT ws_sample.gw_api_getvisit($${"client":{"device":3,"infoType":100,"lang":"es"}, "feature":{"id":10},"form":{},"data":{},"fields":{},"pageInfo":null}}$$)`

			*/

			$query  						=	"SELECT SCHEMA.gw_api_getvisit(".$data.") AS result";

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwGetVisit HARDCODED","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gwGetVisit HARDCODED","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwGetVisit HARDCODED","Error in gwGetVisit HARDCODED","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}
 	//****************************************************************
	//************             END GET VISITS         ****************
	//****************************************************************

	//****************************************************************
	//************          GET VISIT MANAGER         ****************
	//****************************************************************

	/***
		method gwGetVisit
			Gets visits

			@param $device <int>
			@param $formData <JSON>

			@return JSON

	***/

	public function gwGetVisitManager($pol_id,$id_name,$info_type,$device,$formParameters,$formFeatureData,$formPagination,$formData,$extraData,$what,$deviceTrace,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"device"								=> $device,
				"formParameters"				=> $formParameters,
				"formFeatureData"				=> json_decode($formFeatureData),
				"formPagination"				=> json_decode($formPagination),
				"extraData"							=> json_decode($extraData),
				"deviceTrace"						=> json_decode($deviceTrace),
				"formData"							=> $formData,
				"info_type"							=> $info_type,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> $what
			);
			if($extraData=="null"){
				$extraData = null;
			}else{
				$extraData 	= substr($extraData, 1, -1);
			}
			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);
			//remove first { and last } from parameters e.g "form":{"tabData":{"active":true: }
			if($formParameters!="{}"){
				$form 	= substr($formParameters, 1, -1);
			}else{
				$form 	= '"form":'.$formParameters;
			}
			if($formFeatureData=="null"){
				$formFeatureData = null;
			}else{
				$formFeatureData = '"feature":'.$formFeatureData;
			}

			if(!$formPagination){
				$formPagination = 'null';
			}
			$data 	= '$${';
			$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';


			if($what==="gwGetVisitManager" ||  $what==="gwSetVisitManager"){
				if($formFeatureData){
					$data 	.= $formFeatureData.',';
				}
				if($what==="gwGetVisitManager"){
					$data 	.= $form.',';
				}
				$data 	.='"data":{';
				if($what==="gwGetVisitManager"){
					$data 	.='"relatedFeature":{"type":"'.$this->_clean_id_name($id_name).'", "id":"'.$pol_id.'"},';
				}
				$data 	.='"fields":'.json_encode($formData,JSON_FORCE_OBJECT).',"deviceTrace":'.$deviceTrace;
				if($what==="gwGetVisitManager"){
					$data		.= ',"pageInfo":'.$formPagination;
				}
				if($extraData){
					$data .= ','.$extraData;
				}
				$data 	.='}';


		/*		SELECT ws_sample.gw_api_setvisitmanager($${
 "client":{"device":3, "infoType":100, "lang":"ES"},
"feature":{"featureType":"visit", "tableName":"ve_visit_user_manager", "idName":"user_id", "id":"geoadmin"},
"data":{"fields":{"team_id":4, "vehicle_id":2, "starttime":"2019-01-01", "endtime":null},
"deviceTrace":{"xcoord":8597877, "ycoord":5346534, "compass":123}}}$$)*/

			}else{
				$data 	.= '"form":{},"data":{}';
			}

			$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user
			/*
			--init call
			SELECT ws_sample.gw_api_getvisitmanager($${
			"client":{"device":3,"infoType":100,"lang":"es"},
			"form":{},
			"data":{}}$$)
			-- change from tab data to tab files (upserting data on tabData)
			SELECT ws_sample.gw_api_getvisitmanager($${
			"client":{"device":3,"infoType":100,"lang":"es"},
			"feature":{"featureType":"visit","tableName":"ve_visit_user_manager","idName":"user_id","id":"xtorret"},
			"form":{"tabData":{"active":false}, "tabLots":{"active":true},"navigation":{"currentActiveTab":"tabData"}},
			"data":{"fields":{"user_id":"xtorret","team_id":1,"vehicle_id":1,"date":"2019-01-01"}}}$$)
			--tab activelots
			SELECT ws_sample.gw_api_getvisitmanager($${
			"client":{"device":3, "infoType":100, "lang":"ES"},
			"feature":{},
			"form":{"tabData":{"active":false}, "tabLots":{"active":true}}, "navigation":{"currentActiveTab":"tabLots"},
			"data":{"filterFields":{"limit":10},
			    "pageInfo":{"currentPage":1}
			    }}$$)

				`SELECT ws_sample.gw_api_setvisitmanagerstart($${"client":{"device":3,"infoType":100,"lang":"es"},"form":{},"data":{}}$$)`
				`SELECT ws_sample.gw_api_setvisitmanagerend($${"client":{"device":3,"infoType":100,"lang":"es"},"form":{},"data":{}}$$)`
			*/
			if($what==="gwGetVisitManager"){
				$query  						=	"SELECT SCHEMA.gw_api_getvisitmanager(".$data.") AS result";
			}else if($what==="gw_api_setvisitmanagerstart"){
				$query  						=	"SELECT SCHEMA.gw_api_setvisitmanagerstart(".$data.") AS result";
			}else if($what==="gw_api_setvisitmanagerend"){
				$query  						=	"SELECT SCHEMA.gw_api_setvisitmanagerend(".$data.") AS result";
			}else if($what==="gwSetVisitManager"){
				$query  						=	"SELECT SCHEMA.gw_api_setvisitmanager(".$data.") AS result";
			}


			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],$what."()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in ".$what,"KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwGetVisitManager","Error in ".$what,"KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//***********         END GET VISIT MANAGER       ****************
	//****************************************************************

	//****************************************************************
	//************                SET VISIT           ****************
	//****************************************************************


	/***
		method gwSetVisit
			set Visit

			@param $device <int>
			@param $formData <JSON>

			@return JSON

	***/

	public function gwSetVisit($pol_id,$id_name,$info_type,$featureType,$id,$tableName,$idName,$formData,$deviceTrace,$device,$extraData,$photos,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"device"								=> $device,
				"info_type"							=> $info_type,
				"featureType"						=> $featureType,
				"tableName"							=> $tableName,
				"idName"								=> $idName,
				"id"										=> $id,
				"formData"							=> $formData,
				"extraData"							=> $extraData,
				"expected_api_version"	=> $expected_api_version,
				"deviceTrace"						=> json_decode($deviceTrace),
        "photos"						    => $photos,
				"evt"										=> "gwSetVisit"
			);
			if($id==null){
				$id = "null";
			}
			if($extraData=="null"){
				$extraData = null;
			}else{
				$extraData 	= substr($extraData, 1, -1);
			}
			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}

			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);
			$data 	= '$${';
			$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
			$data 	.='"form":{},';
			$data 	.='"feature":{"featureType":"'.$featureType.'", "tableName":"'.$tableName.'", "id":'.$id.', "idName":"'.$idName.'"},';
			$data 	.='"data":{"fields":'.$formDataToInsert.',"photos":'.$photos.',"deviceTrace":'.$deviceTrace;
      if($extraData){
        $data .= ','.$extraData;
      }
      $data 	.='}';
			$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user


			/*
			New aug' 19

			Sgw_api_setvisit($${
			"client":{"device":3,"infoType":0,"lang":"es"},
			"form":{},
			"feature":{"featureType":"visit", "tableName":"ve_visit_arc_insp", "id":1037, "idName":"arc_id"},
			"data":{
				"fields":{"class_id":"6","lot_id":null,"desperfectes_arc":"3","clean_arc":"2","startdate":"2019-08-09 13:11","enddate":null,"status":"3"},
				"deviceTrace":{"xcoord":419125.2203122423,"ycoord":4576799.153693917,"compass":null},
				"newFile":{"fileFields":{"visit_id":1037,"hash":"5d4d54999b798a0c85284105","url":"https://bmaps2./bmaps/external.doc.php?img=5d4d54999b798a0c85284105&extension=txt&name=test,txt","fextension":"txt","idval":"test"},"deviceTrace":{"xcoord":435038.95573942707,"ycoord":4598500.777987193,"compass":0}}}
			}$$) AS result
			 */

			/*--INSERT
			SELECT ws_sample.gw_api_setvisit($${
			"client":{"device":3, "infoType":100, "lang":"ES"},
			"form":{},
			"feature":{"featureType":"visit", "tableName":"ve_visit_arc_insp", "id":null, "idname":"visit_id"},
			"data":{"fields":{"class_id":6, "arc_id":"2001", "visitcat_id":1, "ext_code":"testcode", "sediments_arc":10, "desperfectes_arc":1, "neteja_arc":3},
			    "deviceTrace":{"xcoord":8597877, "ycoord":5346534, "compass":123}}
			    }$$)

			--UPDATE
			SELECT ws_sample.gw_api_setvisit($${
			"client":{"device":3, "infoType":100, "lang":"ES"},
			"form":{},
			"feature":{"featureType":"visit", "tableName":"ve_visit_arc_insp", "id":1159,"idname":"visit_id"},
			"data":{"fields":{"class_id":6, "arc_id":"2001", "visitcat_id":1, "ext_code":"testsdgsdgsghaghcode", "sediments_arc":101121200, "desperfectes_arc":1, "neteja_arc":3},
			    "deviceTrace":{"xcoord":8597877, "ycoord":5346534, "compass":123}}
				}$$)


		/*	SELECT ud_sample_full.gw_api_setvisit($$
          {"client":
            {"device":3,"infoType":0,"lang":"es"},
            "form":{},
            "feature":{"featureType":"visit", "tableName":"ve_visit_emb_neteja", "id":1161, "idName":"visit_id"},
            "data":
              {"fields":
                {"class_id":"7","visit_id":"1161","gully_id":"30079","lot_id":"8","emb_netejat":"1","emb_res_organic":"false","emb_res_ciment":"false","emb_res_sorra":"false","emb_res_quimics":"false","status":"4"},
                "photos":[{"v_photo_url":"xxxx111","hash":"xxx222"},{"v_photo_url":"yyy333","hash":"yyy444"}],
                "deviceTrace":{"xcoord":419335.77813967806,"ycoord":4576624.01402008,"compass":null}
              }
            }
          $$) AS result*/





			$query  						=	"SELECT SCHEMA.gw_api_setvisit(".$data.") AS result";

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwSetVisit()","OK",$logData);
        //update attached photos
        $this->updateAttachedFiles($photos);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gwSetVisit","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwSetVisit","Error in gwSetVisit","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************            END SET VISIT           ****************
	//****************************************************************

	//****************************************************************
	//************               SET DELETE           ****************
	//****************************************************************

	/***
		method gwSetDelete
			set Visit

			@param $device <int>
			@param $formData <JSON>

			@return JSON

	***/

	public function gwSetDelete($pol_id,$id_name,$info_type,$featureType,$id,$tableName,$idName,$formData,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"device"								=> $device,
				"info_type"							=> $info_type,
				"featureType"						=> $featureType,
				"tableName"							=> $tableName,
				"idName"								=> $idName,
				"id"										=> $id,
				"formData"							=> $formData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "gwSetDelete"
			);

			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);

				$data 	= '$${';
				$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
				$data 	.='"form":{},';
				$data 	.='"feature":{"featureType":"'.$featureType.'", "tableName":"'.$tableName.'", "id":'.$id.', "idName":"'.$idName.'"}';
				$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*SELECT ws_sample.gw_api_setdelete('{
				"client":{"device":3, "infoType":100, "lang":"ES"},
				"feature":{"featureType":"visit",
				"tableName":"om_visit", "id":10465, "idName": "id"}}'))*/

			$query  						=	"SELECT SCHEMA.gw_api_setdelete(".$data.") AS result";

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwSetDelete()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gwSetDelete","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwSetDelete","Error in gwSetDelete","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************                 Get Lot            ****************
	//****************************************************************

	/***
		method gwGetLot

			@return JSON

	***/

	public function gwGetLot($pol_id,$id_name,$info_type,$featureType,$id,$tableName,$idName,$formData,$device,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"device"								=> $device,
				"info_type"							=> $info_type,
				"featureType"						=> $featureType,
				"tableName"							=> $tableName,
				"idName"								=> $idName,
				"id"										=> $id,
				"formData"							=> $formData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "gwGetLot"
			);

			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);
			if($id==null){
				$id = '"NULL"';
			}
			$data 	= '$${';
			$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
			$data 	.='"feature":{"featureType":"'.$featureType.'", "tableName":"'.$tableName.'", "id":'.$id.', "idName":"'.$idName.'"}';
			$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*SELECT ws_sample.gw_api_getlot($${"client":{"device":3,"infoType":100,"lang":"es"}, "feature":{"tableName":"om_visit_lot", "idName":"id", "id":"1"}}$$))*/

			$query  						=	"SELECT SCHEMA.gw_api_getlot(".$data.") AS result";

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwGetLot()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gwGetLot","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwGetLot","Error in gwGetLot","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************                 Set Lot            ****************
	//****************************************************************

	/***
		method gwGetLot



			@return JSON

	***/

	public function gwSetLot($pol_id,$id_name,$info_type,$featureType,$id,$tableName,$idName,$formData,$device,$deviceTrace,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"pol_id"								=> $pol_id,
				"id_name"								=> $id_name,
				"device"								=> $device,
				"deviceTrace"						=> $deviceTrace,
				"info_type"							=> $info_type,
				"featureType"						=> $featureType,
				"tableName"							=> $tableName,
				"idName"								=> $idName,
				"id"										=> $id,
				"formData"							=> $formData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "gwSetLot"
			);

			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);

				$data 	= '$${';
				$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
				$data 	.='"form":{},';
				$data 	.='"feature":{"featureType":"'.$featureType.'", "tableName":"'.$tableName.'", "id":'.$id.', "idName":"'.$idName.'"},';
				$data 	.='"data":{"fields":'.$formDataToInsert.'}';
				$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*SELECT ws_sample.gw_api_setlot($${
			"client":{"device":3,"infoType":100,"lang":"es"},
			"feature":{"tableName":"om_visit_lot", "idName":"id", "id":"1"},
			"form":{},"data":{"fields":{}}}$$)*/
			$query  						=	"SELECT SCHEMA.gw_api_setlot(".$data.") AS result";

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwSetLot()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gwSetLot","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwSetLot","Error in gwSetLot","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************                END Set Lot         ****************
	//****************************************************************

	//****************************************************************
	//************             Set Vehicle load       ****************
	//****************************************************************

	/***
		method gw_api_setvehicleload



			@return JSON

	***/

	public function gwSetVehicleLoad($info_type,$formData,$device,$deviceTrace,$expected_api_version){
		try{
			$startTime = microtime(true);
			$logData 	= array(
				"device"								=> $device,
				"deviceTrace"						=> $deviceTrace,
				"info_type"							=> $info_type,
				"formData"							=> $formData,
				"expected_api_version"	=> $expected_api_version,
				"evt"										=> "gwSetVehicleLoad"
			);

			//convert "0" to 0
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}
			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);

				$data 	= '$${';
				$data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
				$data 	.='"form":{},';
				$data 	.='"feature":{},';
				$data 	.='"data":{"fields":'.$formDataToInsert.',';
        $data 	.='"deviceTrace":{"xcoord":null,"ycoord":null,"compass":null},';
				$data 	.='"pageInfo":null}';
				$data 	.='}$$';


			$layerInfo					= $this->_getLayerInfo(null); //null will use postgres current user

			/*SELECT ud_sample_full.gw_api_setvehicleload(
				$${"client":
					{"device":3,"infoType":0,"lang":"es"},
					"form":{},
					"feature":{},
					"data":{"fields":{"vehicle_id":"2", "lot_id":2, "team_id":1,"load":"99", "hash":"testhash", "user_id":"test"},
					"deviceTrace":{"xcoord":null,"ycoord":null,"compass":null},
					"pageInfo":null}
				}$$) AS result*/
			$query  						=	"SELECT SCHEMA.gw_api_setvehicleload(".$data.") AS result";

			$response						= $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
			$logData						= $this->_prepareLog($logData,$query,$response,$startTime);
			if($response['status']==="Accepted"){
				$res 				= $response['message'];
				$this->_log($logData['evt'],"gwSetVehicleLoad()","OK",$logData);
				return array("status"=>"Accepted","message"=>$res,"code"=>200);
			}else{
				$this->_log($logData['evt'],"Error in gwSetVehicleLoad","KO",$logData);
				return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
			}
		}catch(Exception $e){
			$logData['Exception'] 		= $e->getMessage();
			$logData['ExceptionLine'] = $e->getLine();
			$logData['ExceptionFile'] = $e->getFile();
			$this->_log("gwSetLot","Error in gwSetVehicleLoad","KO",$logData);
			return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
		}
	}

	//****************************************************************
	//************         END Set vehicle load       ****************
	//****************************************************************

  //****************************************************************
	//************           SET UNIT INTERVAL        ****************
	//****************************************************************

  public function gw_fct_setunitinterval($info_type,$formData,$device,$deviceTrace,$visit_id,$expected_api_version){
    //try{
      $startTime = microtime(true);
      $logData 	= array(
        "device"								=> $device,
        "deviceTrace"						=> $deviceTrace,
        "info_type"							=> $info_type,
        "formData"							=> $formData,
				"visit_id" => $visit_id,
        "expected_api_version"	=> $expected_api_version,
        "evt"										=> "gw_fct_setunitinterval"
      );
			foreach($formData as $key=>$val){
				if($val==="0"){
					$formData[$key] = (int)0;
				}
			}

			$formDataToInsert = json_encode($formData,JSON_FORCE_OBJECT);
      $data 	= '$${';
      $data 	.='"client":{"device":'.$device.',"infoType":'.$info_type.',"lang":"'.$_SESSION['lang'].'"},';
      $data 	.='"feature":{"featureType":"visit","tableName":"ve_visit_tram_neteja","idName":"visit_id","id":'.$visit_id.'},';
      $data 	.='"form":{"tabData":{"active":true},"tabFiles":{"active":false},"navigation":{"currentActiveTab":"tab_data"}},';
			$data 	.='"data":{"fields":'.$formDataToInsert.',';
      //$data 	.='"fields":{"class_id":"15","startdate":"2022-04-01 15:26","lot_id":"1010","unit_id":"1032","arc_id":"4736","tram_exec_visit":0,"status":"4"},';
      $data 	.='"pageInfo":null}';
      $data 	.='}$$';
      $layerInfo = $this->_getLayerInfo(null); //null will use postgres current user

      /*
      SELECT ($${
      "client":{"device":3,"infoType":0,"lang":"ca"},
      "feature":{"featureType":"visit","tableName":"ve_visit_tram_neteja","idName":"visit_id","id":488192},
      "form":{"tabData":{"active":true},"tabFiles":{"active":false},"navigation":{"currentActiveTab":"tab_data"}},
      "data":{"relatedFeature":{"type":"unit", "id":"1032", "tableName":"ve_lot_x_unit_web"},
      "fields":{"class_id":"15","startdate":"2022-04-01 15:26","lot_id":"1010","unit_id":"1032","arc_id":"4736","tram_exec_visit":0,"status":"4"},"pageInfo":null}}$$) AS result
      Realment de la funció només necessito aixó:
      SELECT gw_fct_setunitinterval($${
      "client":{"device":3,"infoType":0,"lang":"ca"},
      "feature":{"featureType":"visit","tableName":"ve_visit_tram_neteja","idName":"visit_id","id":488192},
      "form":{"tabData":{"active":true},"tabFiles":{"active":false},"navigation":{"currentActiveTab":"tab_data"}},
      "data":{"relatedFeature":{"type":"unit", "id":"1032", "tableName":"ve_lot_x_unit_web"},
      "fields":{"class_id":"15","startdate":"2022-04-01 15:26","lot_id":"1010","unit_id":"1032","arc_id":"4736","tram_exec_visit":0,"status":"4"},"pageInfo":null}}$$) AS result
       */
       $query = "SELECT SCHEMA.gw_fct_setunitinterval(".$data.") AS result";

       $response = $this->_doQuery(null,$query,$layerInfo,$logData,null,$expected_api_version);
       $logData = $this->_prepareLog($logData,$query,$response,$startTime);
       if($response['status']==="Accepted"){
         $res = $response['message'];
         $this->_log($logData['evt'],"gw_fct_setunitinterval()","OK",$logData);
         return array("status"=>"Accepted","message"=>$res,"code"=>200);
       }else{
         $this->_log($logData['evt'],"Error in gw_fct_setunitinterval","KO",$logData);
         return array("status"=>"Failed","message"=>$logData["result"],"code"=>501);
       }
    /*}catch(Exception $e){
      $logData['Exception'] 		= $e->getMessage();
      $logData['ExceptionLine'] = $e->getLine();
      $logData['ExceptionFile'] = $e->getFile();
      $this->_log("gwSetLot","Error in gw_fct_setunitinterval","KO",$logData);
      return array("status"=>"Failed","message"=>$e->getMessage()." ".$e->getLine(),"code"=>501);
    }*/

  }



}
