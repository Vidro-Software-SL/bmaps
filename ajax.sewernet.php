<?php

class ControllerIndex
{
	private $_system;
	private $_hat;
	private $_shoe;
	function __construct()
	{

		header('Content-Type: application/json');
		require_once 'libs/config.php'; //Archivo con configuraciones.
		//$check								= new Check();
		$this->_system 				= System::singleton(); //contiene objeto system
		$_POST 								= json_decode(file_get_contents('php://input'), true);
		require_once 'libs/apps/projects/class.projects.sewernet.php';
		$projects 						= new ProjectsSewernet();
		$what   							= (empty($_POST['what'])) 									? null 			: $_POST['what'];
		$token   							= (empty($_POST['token'])) 									? null 			: $_POST['token'];
		$layer   							= (empty($_POST['layer'])) 									? null 			: $_POST['layer'];
		$db_table 						= (empty($_POST['db_table'])) 							? null 			: $_POST['db_table'];
		$device   						= (empty($_POST['device'])) 								? null 			: $_POST['device'];
		$pol_id  							= (empty($_POST['pol_id'])) 								? null 			: $_POST['pol_id'];
		$id_name 							= (empty($_POST['id_name'])) 								? null 			: $_POST['id_name'];
		$expected_api_version = (empty($_POST['expected_api_version'])) 	? "0.9.101" : $_POST['expected_api_version'];
		$_SESSION['expected_api_version'] = $expected_api_version;
		unset($_POST['layer']);
		unset($_POST['db_table']);
		unset($_POST['expected_api_version']);
		unset($_POST['pol_id']);
		unset($_POST['id_name']);
		unset($_POST['what']);
		unset($_POST['device']);
		unset($_POST['token']);
		$_token = (isset($_SESSION['token'])) ? $_SESSION['token'] : null;
		if ($token === $_token) {
			if ($what === "ELEMENTS" || $what === "VISITS") {
				$form  					= (empty($_POST['form'])) 				? null 		: $_POST['form'];
				$options 				= (empty($_POST['options'])) 			? null 		: $_POST['options'];
				$tabName 				= (empty($_POST['tabName'])) 			? null 		: $_POST['tabName'];
				if ($options) {
					$opt_array 		= json_decode($options, true);
				} else {
					$opt_array		= null;
				}
				//print_r($opt_array);
				if ($what === "VISITS") {
					$req 					= $projects->getInfoVisits($device, $pol_id, $id_name, $opt_array, $expected_api_version);
				} else {
					$req 					= $projects->getWebForms($form, $device, $layer, $pol_id, $id_name, $opt_array, $tabName, $expected_api_version);
				}
				echo json_encode($req);
			} elseif ($what === "GET_INFO_FILES") {
				$form  					= (empty($_POST['form'])) 				? null 		: $_POST['form'];
				$selected_layer = (empty($_POST['selected_layer'])) ? null : $_POST['selected_layer'];
				$tableName = (empty($_POST['tableName'])) ? null : $_POST['tableName'];
				$tabName 				= (empty($_POST['tabName'])) 			? null 		: $_POST['tabName'];
				$req = $projects->getInfoFiles($device, $pol_id, $id_name, $selected_layer, $tableName, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "SET_FEAUTURE_FILE") {
				$info_type = (empty($_POST['info_type'])) ? 0 : $_POST['info_type'];
				$tableName = (empty($_POST['tableName'])) ? null : $_POST['tableName'];
				$idName = (empty($_POST['idName'])) ? null : $_POST['idName'];
				$pol_id = (empty($_POST['id'])) ? null : $_POST['id'];
				$deviceTrace = (empty($_POST['deviceTrace'])) ? 0 : $_POST['deviceTrace'];
				$photos = (empty($_POST['photos'])) ? "[]" : $_POST['photos'];
				$req = $projects->setfeaturefile($pol_id, $idName, $info_type, $tableName, $photos, $deviceTrace, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "DELETE_FEAUTURE_FILE") {
				$info_type = (empty($_POST['info_type'])) ? 0 : $_POST['info_type'];
				$file_id = (empty($_POST['file_id'])) ? null : $_POST['file_id'];
				$pol_id = (empty($_POST['id'])) ? null : $_POST['id'];
				$req = $projects->deleteFeatureFile($pol_id, $file_id, $info_type, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_INFO_FORM" || $what === "GET_INFO_FORM_FROM_ID") {
				$edit  					= (empty($_POST['edit'])) 				? FALSE 	: $_POST['edit'];
				$info_type  		= (empty($_POST['info_type'])) 		? 0 	: $_POST['info_type'];
				$req 						= $projects->getInfoFormFromId($layer, $db_table, $id_name, $pol_id, $edit, $device, $info_type, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_INFO_FORM_FROM_COORDINATES" || $what === "GET_INFO_FORM_FROM_POLYGON") {
				$active_layer  				= (empty($_POST['active_layer'])) 					? null 		: $_POST['active_layer'];
				$visible_layers  			= (empty($_POST['visible_layers'])) 				? null 		: $_POST['visible_layers'];
				$epsg  								= (empty($_POST['epsg'])) 									? FALSE 	: $_POST['epsg'];
				$info_type  					= (empty($_POST['info_type'])) 							? 0 			: $_POST['info_type'];
				$zoomlevel  					= (empty($_POST['zoomlevel'])) 							? 0 			: $_POST['zoomlevel'];
				$editable_layers			= (empty($_POST['editable_layers'])) 				? null 		: $_POST['editable_layers'];
				$use_tiled_background	= (empty($_POST['use_tiled_background'])) 	? false 	: $_POST['use_tiled_background'];
				if ($what === "GET_INFO_FORM_FROM_POLYGON") {
					$polygon = (empty($_POST['polygon'])) ? null : $_POST['polygon'];
					$req = $projects->getInfoFromPolygon($polygon, $active_layer, $visible_layers, $editable_layers, $epsg, $zoomlevel, $device, $info_type, $use_tiled_background, $expected_api_version);
				} else {
					$x = (empty($_POST['x'])) ? null : $_POST['x'];
					$y = (empty($_POST['y'])) ? null : $_POST['y'];
					$req = $projects->getInfoFromCoordinates($x, $y, $active_layer, $visible_layers, $editable_layers, $epsg, $zoomlevel, $device, $info_type, $use_tiled_background, $expected_api_version);
				}
				echo json_encode($req);
			} elseif ($what === "SET_FORM_COORDINATES") {
				$pos_x  				= (empty($_POST['pos_x'])) 		? null 		: $_POST['pos_x'];
				$pos_y   				= (empty($_POST['pos_y'])) 		? null 		: $_POST['pos_y'];
				$zoom   				= (empty($_POST['zoom'])) 		? null 		: $_POST['zoom'];
				$form_id   			= (empty($_POST['form_id'])) 	? null 		: $_POST['form_id'];
				$srid						= (empty($_POST['srid'])) 		? null 		: $_POST['srid'];
				$uniqueId				= (empty($_POST['uniqueId'])) ? null 		: $_POST['uniqueId'];
				$req 						= $projects->setFormCoordinates($pos_x, $pos_y, $zoom, $srid, $form_id, $device, $uniqueId, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "VISITS_FROM_FEAUTURE") {
				$form  					= (empty($_POST['form'])) 				? null 		: $_POST['form'];
				$options 				= (empty($_POST['options'])) 			? null 		: $_POST['options'];
				if ($options) {
					$opt_array 		= json_decode($options, true);
				} else {
					$opt_array		= null;
				}
				$req 					= $projects->getVisitsFromFeature($device, $layer, $pol_id, $id_name, $opt_array, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "DELETE_VISIT") {
				$visit_id  			= (empty($_POST['visit_id'])) 			? null 		: $_POST['visit_id'];
				$req 						= $projects->deleteVisit($visit_id, $layer, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_EVENT_FORM_TYPE_AND_EVENT") {
				require_once 'libs/apps/projects/class.events.sewernet.php';
				$visit_parameter_id = (empty($_POST['visit_parameter_id'])) 	? null 		: $_POST['visit_parameter_id'];
				$arc_id  						= (empty($_POST['arc_id'])) 							? null 		: $_POST['arc_id'];
				$events 						= new EventsSewernet();
				$req 								= $events->getEventFormTypeAndEvent($visit_parameter_id, $arc_id, $id_name, $layer, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_EVENT") {
				require_once 'libs/apps/projects/class.events.sewernet.php';
				$event_id 					= (empty($_POST['event_id'])) 						? null 		: $_POST['event_id'];
				$events 						= new EventsSewernet();
				$req 								= $events->getEventSwernet($layer, $event_id, $pol_id, $id_name, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_EVENT") {
				$key  					= (empty($_POST['key'])) 					? null 		: $this->_system->nohacker($_POST['key']);
				$value  				= (empty($_POST['value'])) 				? null 		: $this->_system->nohacker($_POST['value']);
				$event_id  			= (empty($_POST['event_id'])) 		? null 		: $this->_system->nohacker($_POST['event_id']);
				require_once 'libs/apps/projects/class.events.sewernet.php';
				$events 				= new EventsSewernet();
				$req 						= $events->updateEvent($layer, $event_id, $key, $value, $pol_id, $id_name, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "DELETE_EVENT") {
				$event_id  			= (empty($_POST['event_id'])) 		? null 		: $this->_system->nohacker($_POST['event_id']);
				require_once 'libs/apps/projects/class.events.sewernet.php';
				$events 				= new EventsSewernet();
				$req 						= $events->deleteEvent($layer, $event_id, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "INSERT_EVENT") {
				require_once 'libs/apps/projects/class.events.sewernet.php';
				$visit_id  			= (empty($_POST['visit_id'])) 		? null 		: $_POST['visit_id'];
				$formId  				= (empty($_POST['formId'])) 			? null 		: $_POST['formId'];
				$photos  				= (empty($_POST['photos'])) 			? null 		: $_POST['photos'];
				$compasses  		= (empty($_POST['compasses'])) 		? null 		: $_POST['compasses'];

				//dynamic attributes
				//unset properties not present in db table
				unset($_POST['token']);
				unset($_POST['formId']);
				unset($_POST['photos']);
				unset($_POST['compasses']);
				$eventData			= array();
				foreach ($_POST as $key => $value) {
					$eventData[$key] = $value;
				}
				$events 						= new EventsSewernet();
				$req 								= $events->insertEvent($layer, $visit_id, $pol_id, $id_name, $eventData, $formId, $photos, $compasses, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_GALLERY") {
				$type  				= (empty($_POST['type'])) 		? null 		: $_POST['type'];
				$id  					= (empty($_POST['id'])) 			? null 		: $_POST['id'];
				require_once 'libs/apps/projects/class.photos.sewernet.php';
				$pho 				= new PhotosSewernet();
				$req 				= $pho->getPhotos($id, $type, $layer, null, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "DELETE_EVENT_PHOTO") {
				$hash  				= (empty($_POST['hash'])) 		? null 		: $_POST['hash'];
				require_once 'libs/apps/projects/class.photos.sewernet.php';
				$pho 				= new PhotosSewernet();
				$req 				= $pho->deleteEventPhoto($hash, $layer, null, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_FEATURE_TYPE") {
				$featurecat_id  = (empty($_POST['featurecat_id'])) 	? null 		: $_POST['featurecat_id'];
				$req 						= $projects->getFeatureType($featurecat_id, $layer);
				echo json_encode($req);
			} elseif ($what === "GET_PARAMETER_ID_FOR_PARAMETER_ID") {
				$parameterType  = (empty($_POST['parameterType'])) 	? null 		: $_POST['parameterType'];
				$req 						= $projects->getParameterIdFromParameterType($layer, $parameterType, $id_name, null, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_POSITION_ID_VALUES") {
				require_once 'libs/apps/projects/class.events.sewernet.php';
				$events 				= new EventsSewernet();
				$req 						= $events->getPosition_id_Values($layer, $pol_id, $id_name);
				echo json_encode($req);
			} elseif ($what === "GET_NODES_FOR_ARC_CONNECT") {
				$req 						= $projects->getInfoConnect($device, $layer, $pol_id, $id_name, null, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPSERT_VISIT") {
				$coordinates  	= (empty($_POST['coordinates'])) 	? null 		: $this->_system->nohacker($_POST['coordinates']);
				$epsg  					= (empty($_POST['epsg'])) 				? null 		: $this->_system->nohacker($_POST['epsg']);
				$req 						= $projects->upsertVisit($layer, $pol_id, $id_name, $coordinates, $epsg, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_VISIT") {
				$key  					= (empty($_POST['key'])) 					? null 		: $this->_system->nohacker($_POST['key']);
				$value  				= (empty($_POST['value'])) 				? null 		: $this->_system->nohacker($_POST['value']);
				$visit_id  			= (empty($_POST['visit_id'])) 		? null 		: $this->_system->nohacker($_POST['visit_id']);
				$req 						= $projects->updateVisit($layer, $visit_id, $key, $value, $pol_id, $id_name, $expected_api_version);
				echo json_encode($req);
				//************************** FEATURES **************************
			} elseif ($what === "GET_INSERT_FEATURE_FORM") {
				require_once 'libs/apps/projects/class.features.sewernet.php';
				$features				= new FeaturesSewernet();
				$req 						= $features->getInsertFeatureForm($layer, $db_table, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "INSERT_FEATURE") {
				require_once 'libs/apps/projects/class.features.sewernet.php';
				$features				= new FeaturesSewernet();
				$epsg 					= (empty($_POST['epsg'])) 			? null 		: $_POST['epsg'];
				$formData 			= (empty($_POST['formData'])) 	? null 		: $_POST['formData'];
				$geometry 			= (empty($_POST['geometry'])) 	? null 		: $_POST['geometry'];
				//dynamic attributes
				//unset properties not present in db table
				//print_r($_POST);

				unset($_POST['token']);
				unset($_POST['epsg']);
				unset($_POST['geometry']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req 						= $features->insertFeature($layer, $db_table, $epsg, $formData, $geometry, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "DELETE_FEATURE") {
				require_once 'libs/apps/projects/class.features.sewernet.php';
				$features				= new FeaturesSewernet();
				$epsg 					= (empty($_POST['epsg'])) 			? null 		: $_POST['epsg'];
				$id 						= (empty($_POST['id'])) 				? null 		: $_POST['id'];
				$req 						= $features->deleteFeature($layer, $db_table, $id_name, $id, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_FEATURE") {
				require_once 'libs/apps/projects/class.features.sewernet.php';
				$features				= new FeaturesSewernet();
				$key  					= (empty($_POST['key'])) 					? null 		: $this->_system->nohacker($_POST['key']);
				//clean
				if (getType($_POST['value']) === "string") {
					$value  				= $this->_system->nohacker($_POST['value']);
				} else {
					$value  				= (empty($_POST['value'])) 				? null 		: $this->_system->nohacker($_POST['value']);
				}
				$req 						= $features->updateFeatureSewernet($layer, $db_table, $key, $value, $pol_id, $id_name, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UDPATE_FEATURE_GEOMETRY") {
				require_once 'libs/apps/projects/class.features.sewernet.php';
				$features				= new FeaturesSewernet();
				$geometry 			= (empty($_POST['geometry'])) 		? null 		: $_POST['geometry'];
				$epsg 					= (empty($_POST['epsg'])) 				? null 		: $_POST['epsg'];
				$req 						= $features->updateFeatureGeometry($layer, $db_table, $epsg, $pol_id, $id_name, $geometry, $expected_api_version);
				echo json_encode($req);
			}
			//********************* END FEATURES **********************

			//*****************        FILTERS       ******************
			elseif ($what === "GET_FILTERS") {
				require_once 'libs/apps/projects/class.filters.php';
				$exploitation					= new Filters();
				$use_tiled_background	= (empty($_POST['use_tiled_background'])) 	? false 	: $_POST['use_tiled_background'];
				$req 									= $exploitation->getFilters($device, $use_tiled_background, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_ALL_FILTERS") {
				require_once 'libs/apps/projects/class.filters.php';
				$fil					= new Filters();
				$fields				= (empty($_POST['fields'])) 		? false 	: $_POST['fields'];
				$tabName  		= (empty($_POST['tabName'])) 		? null 		: $this->_system->nohacker($_POST['tabName']);
				$tabIdName  	= (empty($_POST['tabIdName'])) 	? null 		: $this->_system->nohacker($_POST['tabIdName']);
				$req 					= $fil->updateAllFilters($fields, $tabName, $tabIdName, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_FILTERS") {
				require_once 'libs/apps/projects/class.filters.php';
				$exploitation	= new Filters();
				$key  				= (empty($_POST['key'])) 				? 0 		: $this->_system->nohacker($_POST['key']);
				$tabName  		= (empty($_POST['tabName'])) 		? null 	: $this->_system->nohacker($_POST['tabName']);
				$tabIdName  	= (empty($_POST['tabIdName'])) 	? null 	: $this->_system->nohacker($_POST['tabIdName']);
				//clean
				if (getType($_POST['value']) === "string") {
					$value  				= $this->_system->nohacker($_POST['value']);
				} else {
					$value  				= (empty($_POST['value'])) 				? null 		: $this->_system->nohacker($_POST['value']);
				}
				$req 						= $exploitation->updateFilters($key, $value, $tabName, $tabIdName, $expected_api_version);
				echo json_encode($req);
			}
			//*****************   END FILTERS    ******************

			//*****************     SEARCH       ******************
			elseif ($what === "GET_SEARCH") {
				require_once 'libs/apps/projects/class.search.php';
				$_search				= new Search();
				$info_type  			= (empty($_POST['info_type'])) ? 0 : $_POST['info_type'];
				$req 						= $_search->getSearch($device, $info_type, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_SEARCH") {
				require_once 'libs/apps/projects/class.search.php';
				$_search				= new Search();
				$searchData  		= $_POST['searchData'];
				$req 						= $_search->updateSearch($searchData, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_SEARCH_ADD") {
				require_once 'libs/apps/projects/class.search.php';
				$_search				= new Search();
				$searchData  		= $_POST['searchData'];
				$req 						= $_search->updateSearchAdd($searchData, $expected_api_version);
				echo json_encode($req);
			}
			//*****************   END SEARCH    ******************

			//*****************      PRINT      ******************
			elseif ($what === "GET_PRINT") {
				require_once 'libs/apps/projects/class.print.php';
				$_print				= new PrintSewernet();
				$composers  	= (empty($_POST['composers'])) 			? null 		: $_POST['composers'];
				$req 					= $_print->getPrint($composers, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_PRINT") {
				require_once 'libs/apps/projects/class.print.php';
				$_print									= new PrintSewernet();
				$extent   							= (empty($_POST['extent'])) 								? null 		: $_POST['extent'];
				$use_tiled_background  	= (empty($_POST['use_tiled_background'])) 	? null 		: $_POST['use_tiled_background'];

				unset($_POST['use_tiled_background']);

				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req 					= $_print->updatePrint($formData, $extent, $device, $use_tiled_background, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "CLEAN_PRINT") {
				$path = $this->_system->get('basedirContenidos') . $_POST['composer'] . ".pdf";
				@unlink($path);
				echo json_encode(array("status" => "Accepted"));
			}
			//*****************    END PRINT    ******************

			//*****************      MINCUT     ******************
			elseif ($what === "UPSERT_MINCUT") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$mincut_id  		= (empty($_POST['mincut_id'])) 			? null 		: $_POST['mincut_id'];
				$x   						= (empty($_POST['x'])) 							? null 		: $_POST['x'];
				$y  						= (empty($_POST['y'])) 							? null 		: $_POST['y'];
				$srid  					= (empty($_POST['srid'])) 					? FALSE 	: $_POST['srid'];

				unset($_POST['mincut_id']);
				unset($_POST['epsg']);
				unset($_POST['srid']);
				unset($_POST['x']);
				unset($_POST['y']);

				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req 						= $_mincut->upsertMincut($mincut_id, $x, $y, $srid, $device, $id_name, $pol_id, $formData, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_MINCUT") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$mincut_id_arg  = (empty($_POST['mincut_id_arg'])) 	? null 		: $_POST['mincut_id_arg'];
				$x   						= (empty($_POST['x'])) 							? null 		: $_POST['x'];
				$y  						= (empty($_POST['y'])) 							? null 		: $_POST['y'];
				$epsg  					= (empty($_POST['epsg'])) 					? FALSE 	: $_POST['epsg'];
				$req 						= $_mincut->getMincut($x, $y, $epsg, $mincut_id_arg, $device, $id_name, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_INFO_MINCUT") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$toDate   			= (empty($_POST['toDate'])) 	? null 		: $_POST['toDate'];
				$fromDate   		= (empty($_POST['fromDate']))	? null 		: $_POST['fromDate'];
				$req 						= $_mincut->getInfoMincut($id_name, $pol_id, $fromDate, $toDate, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "GET_MINCUT_MANAGER") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();

				unset($_POST['tabName']);

				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req 						= $_mincut->getMincutManager($device, $formData, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_MINCUT_MANAGER") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$tabName				= (empty($_POST['tabName'])) 	? null 		: $_POST['tabName'];
				unset($_POST['tabName']);

				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req 						= $_mincut->updateMincutManager($formData, $tabName, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "EXCLUDE_FROM_MINCUT") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$valve_id  			= (empty($_POST['valve_id'])) 	? null 		: $_POST['valve_id'];
				$mincut_id   		= (empty($_POST['mincut_id'])) 	? null 		: $_POST['mincut_id'];
				$req 						= $_mincut->excludeFromMincut($valve_id, $mincut_id, $device, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "UPDATE_MINCUT_ADD") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$searchData  		= $_POST['searchData'];
				$req 						= $_mincut->updateMincutAdd($searchData, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "END_MINCUT") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$mincut_id   		= (empty($_POST['mincut_id'])) 		? null 		: $_POST['mincut_id'];

				unset($_POST['mincut_id']);
				unset($_POST['epsg']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}

				$req 						= $_mincut->endMincut($mincut_id, $device, $formData, $id_name, $pol_id, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "START_MINCUT") {
				require_once 'libs/apps/projects/class.mincut.php';
				$_mincut				= new Mincut();
				$mincut_id   		= (empty($_POST['mincut_id'])) 	? null 		: $_POST['mincut_id'];
				$req 						= $_mincut->startMincut($mincut_id, $device, $expected_api_version);
				echo json_encode($req);
			}

			//*****************    END MINCUT   ******************
			//***************   DATE SELECTOR   ******************
			elseif ($what === "GET_DATES_SELECTOR_FORM") {
				require_once 'libs/apps/projects/class.dateSelector.php';
				$_dates				= new DateSelector();
				$use_tiled_background	= (empty($_POST['use_tiled_background'])) 	? false 	: $_POST['use_tiled_background'];
				$req 						= $_dates->getDatesForm($device, $use_tiled_background, $expected_api_version);
				echo json_encode($req);
			} elseif ($what === "SET_FILTER_DATE") {
				require_once 'libs/apps/projects/class.dateSelector.php';
				$_dates				= new DateSelector();
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req 					= $_dates->setFilterDate($formData, $device, $expected_api_version);
				echo json_encode($req);
			}

			//*************   END DATE SELECTOR   ****************

			//***************   VISITS NEW IMPLEMENTATION   ******************
			elseif ($what === "gwGetVisit" || $what === "gwGetVisitChapuza") {
				require_once 'libs/apps/projects/class.visits.php';
				$_visits					= new Visits();
				$formParameters   = (empty($_POST['formParameters'])) 	? null 		: $_POST['formParameters'];
				$info_type  			= (empty($_POST['info_type'])) 				? 0 			: $_POST['info_type'];
				$formFeatureData	= (empty($_POST['formFeatureData'])) 	? null		: $_POST['formFeatureData'];
				$formPagination 	= (empty($_POST['formPagination'])) 	? null		: $_POST['formPagination'];
				$extraData 				= (empty($_POST['extraData'])) 				? null 		: $_POST['extraData'];
				$deviceTrace  		= (empty($_POST['deviceTrace'])) 			? 0 			: $_POST['deviceTrace'];
				$visit_id  				= (empty($_POST['visit_id'])) 				? 0 			: $_POST['visit_id'];
				$tableName  			= (empty($_POST['tableName'])) 				? null 			: $_POST['tableName'];
				$visitType  			= (empty($_POST['visitType'])) 				? null 			: $_POST['visitType'];
				$isOffline  			= (empty($_POST['isOffline'])) 				? null 			: $_POST['isOffline'];

				unset($_POST['visitType']);
				unset($_POST['tableName']);
				unset($_POST['visit_id']);
				unset($_POST['formFeatureData']);
				unset($_POST['formPagination']);
				unset($_POST['formParameters']);
				unset($_POST['extraData']);
				unset($_POST['info_type']);
				unset($_POST['deviceTrace']);
				unset($_POST['isOffline']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}

				if ($what === "gwGetVisitChapuza") {
					$req 						= $_visits->gwGetVisitChapuza($pol_id, $id_name, $visitType, $tableName, $visit_id, $info_type, $device, $formParameters, $formFeatureData, $formPagination, $formData, $extraData, $deviceTrace, $expected_api_version);
				} else {
					$req 						= $_visits->gwGetVisit($pol_id, $id_name, $visitType, $tableName, $visit_id, $info_type, $device, $formParameters, $formFeatureData, $formPagination, $formData, $extraData, $deviceTrace, $isOffline, $expected_api_version);
				}
				echo json_encode($req);
			} elseif ($what === "gwSetVisit" || $what === "gwSetDelete" || $what === "gwGetLot" || $what === "gwSetLot") {
				require_once 'libs/apps/projects/class.visits.php';
				$_visits				= new Visits();

				$featureType  	= (empty($_POST['featureType'])) 	? null 		: $_POST['featureType'];
				$tableName  		= (empty($_POST['tableName'])) 		? null 		: $_POST['tableName'];
				$idName  				= (empty($_POST['idName'])) 			? null 		: $_POST['idName'];
				$id		  				= (empty($_POST['id'])) 					? null 		: $_POST['id'];
				$info_type  		= (empty($_POST['info_type'])) 		? 0 			: $_POST['info_type'];
				$deviceTrace  	= (empty($_POST['deviceTrace'])) 	? 0 			: $_POST['deviceTrace'];
				$extraData 			= (empty($_POST['extraData'])) 		? null 		: $_POST['extraData'];
				$photos 			  = (empty($_POST['photos'])) 			? "[]" 		: $_POST['photos'];

				unset($_POST['featureType']);
				unset($_POST['tableName']);
				unset($_POST['idName']);
				unset($_POST['info_type']);
				unset($_POST['id']);
				unset($_POST['deviceTrace']);
				unset($_POST['extraData']);
				unset($_POST['photos']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				if ($what === "gwSetDelete") {
					$req 						= $_visits->gwSetDelete($pol_id, $id_name, $info_type, $featureType, $id, $tableName, $idName, $formData, $device, $expected_api_version);
				} else if ($what === "gwSetVisit") {
					$req 						= $_visits->gwSetVisit($pol_id, $id_name, $info_type, $featureType, $id, $tableName, $idName, $formData, $deviceTrace, $device, $extraData, $photos, $expected_api_version);
				} else if ($what === "gwGetLot") {
					$req 						= $_visits->gwGetLot($pol_id, $id_name, $info_type, $featureType, $id, $tableName, $idName, $formData, $device, $expected_api_version);
				} else if ($what === "gwSetLot") {
					$req 						= $_visits->gwSetLot($pol_id, $id_name, $info_type, $featureType, $id, $tableName, $idName, $formData, $device, $deviceTrace, $expected_api_version);
				}

				echo json_encode($req);
			} elseif ($what === "gwGetVisitManager" || $what === "gw_api_setvisitmanagerstart" || $what === "gw_api_setvisitmanagerend" || $what === "gwSetVisitManager") {
				require_once 'libs/apps/projects/class.visits.php';
				$_visits				= new Visits();

				$formParameters   = (empty($_POST['formParameters'])) 	? null 		: $_POST['formParameters'];
				$info_type  			= (empty($_POST['info_type'])) 				? 0 			: $_POST['info_type'];
				$formFeatureData	= (empty($_POST['formFeatureData'])) 	? null		: $_POST['formFeatureData'];
				$formPagination 	= (empty($_POST['formPagination'])) 	? null		: $_POST['formPagination'];
				$extraData 				= (empty($_POST['extraData'])) 				? null 		: $_POST['extraData'];
				$deviceTrace  		= (empty($_POST['deviceTrace'])) 			? 0 			: $_POST['deviceTrace'];

				unset($_POST['formFeatureData']);
				unset($_POST['formPagination']);
				unset($_POST['formParameters']);
				unset($_POST['extraData']);
				unset($_POST['info_type']);
				unset($_POST['deviceTrace']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}

				$req = $_visits->gwGetVisitManager($pol_id, $id_name, $info_type, $device, $formParameters, $formFeatureData, $formPagination, $formData, $extraData, $what, $deviceTrace, $expected_api_version);
				echo json_encode($req);
			} else if ($what === "SET_VEHICLE_LOAD") {
				require_once 'libs/apps/projects/class.visits.php';
				$_visits = new Visits();

				$info_type  			= (empty($_POST['info_type'])) 				? 0 			: $_POST['info_type'];
				$deviceTrace  		= (empty($_POST['deviceTrace'])) 			? 0 			: $_POST['deviceTrace'];
				$formFeatureData	= (empty($_POST['formFeatureData'])) 	? null		: $_POST['formFeatureData'];
				$formPagination 	= (empty($_POST['formPagination'])) 	? null		: $_POST['formPagination'];
				$extraData 				= (empty($_POST['extraData'])) 				? null 		: $_POST['extraData'];

				unset($_POST['formParameters']);
				unset($_POST['featureType']);
				unset($_POST['formParameters']);
				unset($_POST['info_type']);
				unset($_POST['deviceTrace']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req = $_visits->gwSetVehicleLoad($info_type, $formData, $device, $deviceTrace, $expected_api_version);
				echo json_encode($req);
			}
			//*************   END VISITS NEW IMPLEMENTATION   ****************
			else if ($what === "SET_CURRENT_PROJECT") {
				$project_id  = (empty($_POST['project_id'])) 					? null 		: $_POST['project_id'];
				$_SESSION['currentProject'] = $project_id;
				echo json_encode(array("status" => "Accepted", "message" => null));
			} else if ($what === "GET_GO_2_EPA") {
				$req = $_visits->getgo2epa($info_type, $formData, $device, $deviceTrace, $expected_api_version);
				echo json_encode($req);
			} else if ($what === "SET_GO_2_EPA") {
				$startdate  = (empty($_POST['startdate'])) 					? null 		: $_POST['startdate'];
				$enddate  = (empty($_POST['enddate'])) 					? null 		: $_POST['enddate'];
				require_once 'libs/apps/projects/class.go2epa.php';
				$_go2epa = new Go2Epa();
				$req = $_go2epa->setgo2epa($startdate, $enddate, $device);
				echo json_encode($req);
			} else if ($what === "GET_EXTENT") {
				require_once 'libs/apps/projects/class.extent.php';
				$_ext = new Extent();
				$req = $_ext->getExtent();
				echo json_encode($req);
			} else if ($what === "GET_MULTI_UPDATE") {
				require_once 'libs/apps/projects/class.multiUpdate.php';
				$_ext = new MultiUpdate();
				$ids = (empty($_POST['ids'])) ? null : $_POST['ids'];
				$info_type = (empty($_POST['info_type'])) ? 0 : $_POST['info_type'];
				$req = $_ext->getmultiupdate($ids, $device, $info_type, $db_table);
				echo json_encode($req);
			} else if ($what === "SET_MULTI_UPDATE") {
				require_once 'libs/apps/projects/class.multiUpdate.php';
				$_ext = new MultiUpdate();
				$ids = (empty($_POST['ids'])) ? null : $_POST['ids'];
				$info_type = (empty($_POST['info_type'])) ? 0 : $_POST['info_type'];

				$idName = (empty($_POST['idName'])) ? null : $_POST['idName'];
				unset($_POST['ids']);
				unset($_POST['info_type']);
				unset($_POST['idName']);
				unset($_POST['db_table']);
				unset($_POST['device']);

				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req = $_ext->setmultiupdate($ids, $idName, $device, $info_type, $db_table, $formData);
				echo json_encode($req);
			} else if ($what === "SET_UNIT_INTERVAL") {
				require_once 'libs/apps/projects/class.visits.php';
				$_visits					= new Visits();
				$formParameters   = (empty($_POST['formParameters'])) 	? null 		: $_POST['formParameters'];
				$info_type  			= (empty($_POST['info_type'])) 				? 0 			: $_POST['info_type'];
				$formFeatureData	= (empty($_POST['formFeatureData'])) 	? null		: $_POST['formFeatureData'];
				$formPagination 	= (empty($_POST['formPagination'])) 	? null		: $_POST['formPagination'];
				$extraData 				= (empty($_POST['extraData'])) 				? null 		: $_POST['extraData'];
				$deviceTrace  		= (empty($_POST['deviceTrace'])) 			? 0 			: $_POST['deviceTrace'];
				$visit_id  				= (empty($_POST['visit_id'])) 				? 0 			: $_POST['visit_id'];
				$tableName  			= (empty($_POST['tableName'])) 				? null 			: $_POST['tableName'];
				$visitType  			= (empty($_POST['visitType'])) 				? null 			: $_POST['visitType'];
				$isOffline  			= (empty($_POST['isOffline'])) 				? null 			: $_POST['isOffline'];

				unset($_POST['visitType']);
				unset($_POST['tableName']);
				unset($_POST['visit_id']);
				unset($_POST['formFeatureData']);
				unset($_POST['formPagination']);
				unset($_POST['formParameters']);
				unset($_POST['extraData']);
				unset($_POST['info_type']);
				unset($_POST['deviceTrace']);
				unset($_POST['isOffline']);
				$formData			= array();
				foreach ($_POST as $key => $value) {
					$formData[$key] = $value;
				}
				$req = $_visits->gw_fct_setunitinterval($info_type, $formData, $device, $deviceTrace, $visit_id, $expected_api_version);
				echo json_encode($req);
			}
		} else {
			echo json_encode(array("status" => "Failed", "message" => "Cross site injection detected"));
		}
	}
}

new ControllerIndex();
