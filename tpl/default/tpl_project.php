<!DOCTYPE html>
<html>

<head>
	<base href="tpl/<?php echo $skin; ?>/">
	<link rel="stylesheet" href="css/dist/style.min.css" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet">
	<meta charset="utf-8" />
	<title>BMAPS</title>
</head>
<form id="offline_data">

	<input type="hidden" name="storeName" id="storeName" value="<?php echo $offlineStoreName; ?>">
	<input type="hidden" name="cacheVersion" id="cacheVersion" value="<?php echo $offlineCacheVersion; ?>">
	<input type="hidden" name="localForageVersion" id="localForageVersion" value="<?php echo $offlineLocalForageVersion; ?>">
	<input type="hidden" name="serverInstance" id="serverInstance" value="<?php echo $serverInstance; ?>">
	<input type="hidden" name="user_id" id="user_id" value="<?php echo $user_id; ?>">
	<input type="hidden" name="limit" id="limit" value="<?php echo $limit; ?>">

</form>

<body ng-app="app" ng-controller="mainController as mc" ng-init="initApp('<?php echo $baseHref; ?>','<?php echo $urlWMS; ?>','<?php echo $urlWMTS; ?>','<?php echo $env; ?>','<?php echo $project_id; ?>','<?php echo $urlSocket; ?>','<?php echo $touchDevice; ?>','<?php echo $wsToken; ?>','<?php echo $skin; ?>','<?php echo $project_type; ?>','<?php echo $info_type; ?>','<?php echo $userName; ?>','<?php echo $offlineLogin; ?>','<?php echo $email; ?>','<?php echo $debug; ?>','<?php echo $vidroapi; ?>','<?php echo $vidrotoken; ?>','0.9.101')">
	<header>
		<a href="javascript: return false;" class="menu-toggle closed">
			<img src="img/ic/hamburger.svg" class="svg hamburger" />
			<img src="img/ic/times.svg" class="svg times" />

		</a>

		<div class="brand">
			<a href="<?php echo $baseHref; ?>home.php"><img src="img/logo_project.png" border="0" /></a>
		</div>

		<?php if ((int)$touchDevice > 0) { ?>
			<!-- visit activated indicator for mobile devices -->
			<div class="brand visitSelected" ng-cloak ng-show="mc.AddingVisit">
				<img src="img/ic/toolbar/TB11.svg" border="0" class="svg" />
			</div>
		<?php } ?>

		<ul class="tools">
			<li ng-show="mc.btTable">
				<button-table ng-click="getAttributesTable()" tooltip="<?php echo ATTRIBUTE_TABLE; ?>"></button-table>
			</li>
			<!-- selector de explotaciones y estados -->
			<li ng-show="mc.btFilter">
				<button-filter ng-disabled="filtersDisabled" ng-click="getFormFilters()" tooltip="<?php echo FILTERS; ?>"></button-filter>
			</li>
			<!-- FIN selector de explotaciones y estados -->
			<!-- Search -->
			<li ng-show="mc.btSearch">
				<button-search ng-click="getSearchForm()" tooltip="<?php echo SEARCH; ?>"></button-search>
			</li>
			<!-- Fin Search -->
			<!-- Icono "geolocalizador" -->
			<li ng-show="mc.btGeolocalize"><track-position tooltip="<?php echo DETECT_POSITION; ?>"></track-position></li>
			<!-- FIN Icono "geolocalizador" -->
			<!-- Icono "Zoom In" -->
			<li ng-show="mc.btZoomIn"><zoom-in tooltip="<?php echo ZOOM_IN; ?>"></zoom-in></li>
			<!-- FIN Icono "Zoom In" -->
			<!-- Icono "Zoom out" -->
			<li ng-show="mc.btZoomOut"><zoom-out tooltip="<?php echo ZOOM_OUT; ?>"></zoom-out></li>
			<!-- FIN Icono "Zoom in" -->
			<!-- Icono "Zoom extension" -->
			<li ng-show="mc.btFit"><zoom-extent tooltip="<?php echo ZOOM_TO_EXTENT; ?>"></zoom-extend></li>
			<!-- FIN Icono "Zoom extension" -->
			<!-- Icono "Añadir punto" -->
			<li ng-show="mc.btAddPoint"><add-point tooltip="<?php echo TOOL_ADD_POINT; ?>"></add-point></li>
			<!-- FIN Icono "Añadir punto" -->
			<!-- Icono "Añadir arco" -->
			<li ng-show="mc.btAddLine"><add-line tooltip="<?php echo TOOL_ADD_LINE; ?>"></add-line></li>
			<!-- FIN Icono "Añadir arco" -->
			<!-- Icono "bt Polygon" -->
			<li ng-show="mc.btAddPolygon"><add-polygon tooltip="<?php echo TOOL_ADD_POLYGON; ?>"></add-polygon></li>
			<!-- FIN Icono "bt Polygon" -->
			<!-- Icono "bt go2epa" -->
			<li ng-show="mc.btGo2epa"><button-go2epa tooltip="" ng-click="go2epa()"></button-go2epa></li>
			<!-- FIN Icono "bt go2epa" -->
			<!-- Icono "bt access control" -->
			<li ng-show="mc.btAccessControl"><button-Access-Control tooltip="<?php echo CONTROL_ACCESS; ?>" ng-click="openAccessControlForm()"></button-Access-Control></li>
			<!-- FIN Icono "bt access control" -->
			<!-- Icono "Flow trace" -->
			<li ng-show="mc.btFlowTrace">
				<up-stream tooltip="Upstream"></up-stream>
			</li>
			<!-- FIN Icono "Flow trace" -->
			<!-- Icono "Flow exit" -->
			<li ng-show="mc.btFlowTrace">
				<down-stream tooltip="Downstream"></down-stream>
			</li>
			<!-- FIN Icono "Flow exit" -->
			<!-- Icono "Profile" -->
			<li ng-show="mc.btprofile">
				<profile tooltip="Profile"></profile>
			</li>
			<!-- FIN Icono "Profile" -->
			<!-- Icono "New mincut" -->
			<li ng-show="mc.btMincut"><new-mincut tooltip="Mincut"></new-mincut></li>
			<!-- FIN Icono "End new mincut" -->
			<!-- Icono "Mincut management" -->
			<li ng-show="mc.btMincut"><manage-mincut tooltip="<?php echo MANAGE_MINCUT; ?>"></manage-mincut></li>
			<!-- FIN Icono "Mincut management" -->
			<!--  Icono "Multiple select" -->
			<li ng-show="mc.btmultipleSelect">
				<multiple-select tooltip=""></multiple-select>
			</li>
			<!-- FIN Icono "Multiple select" -->
			<!--  Icono "Polygon select" -->
			<li ng-show="mc.btpolygonSelect">
				<polygon-select tooltip=""></polygon-select>
			</li>
			<!-- FIN Icono "Multiple select" -->
			<!--  Icono "Multiple Update" -->
			<li ng-show="mc.btMultiupdate">
				<button-multi-update tooltip="multiple update" ng-click="multiUpdate()"></button-multi-update>
			</li>
			<!-- FIN Icono "Multiple Update" -->
			<!-- imprimir mapa -->
			<li ng-show="mc.btPrint">
				<button-print ng-click="getPrint()" ng-show="mc.btPrint" tooltip="<?php echo PRINT_STR; ?>"></button-print>
			</li>
			<!-- fin imprimir mapa -->
			<!-- date selector -->
			<li ng-show="mc.btDateSelector">
				<button-date-selector ng-click="getDatesForm()" tooltip="<?php echo DATE_SELECTOR; ?>"></button-date-selector>
			</li>
			<!-- fin date selector -->
			<li ng-show="mc.btMeasureLine"><measure-line tooltip="<?php echo TOOL_MEASURE_DISTANCE; ?>"></measure-line></li>
			<li ng-show="mc.btMeasureArea"><measure-area tooltip="<?php echo TOOL_MEASURE_AREA; ?>"></measure-area></li>
			<!-- Visits -->
			<li ng-show="mc.btVisits"><button-visits tooltip="<?php echo VISITS; ?>" ng-click="gwGetVisit('visit')"></button-visits></li>
			<li ng-show="mc.btIncidence"><button-incidence tooltip="<?php echo INCIDENCE; ?>" ng-click="gwGetVisit('incidence')"></button-incidence></li>
			<li ng-show="mc.btVisitManager"><button-visit-manager tooltip="<?php echo VISIT_MANAGER; ?>" ng-click="gwGetVisitManager()"></button-visit-manager></li>
		</ul>

	</header>

	<div class="menu-toc">
		<div class="sidebar closed">
			<ul>
				<li>
					<a href="#">
						<div class="col col-1"><img src="img/ic/layers.svg" class="svg ico" /></div>
						<div class="col col-2"><?php echo LAYERS; ?></div>
						<div class="col col-3"><img src="img/ic/chevron-right.svg" class="svg chevron pull-right" /></div>
					</a>
					<div class="content zero-padding">

						<div class="toc-layouts">
							<!-- First level -->
							<ul>

								<li ng-repeat="item in mc.layers" ng-class="{'selected': item.isActiveLayer, 'container': item.isContainer}" ng-show="userCanSeeLayer(item.Name)">

									<div class="title" id="layout_{{trimSpacesFromLayerName(item.Title)}}">
										<div ng-class="{'watching': item.isSelected == 1}" class="watchable" ng-click="addRemoveLayer(item,$index)">
											<div class="ico-space">
												<svg class="eye" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
													<path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
												</svg>
												<svg class="eye-off" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
													<path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
												</svg>
											</div>
										</div>

										<span class="title-text" ng-click="setActiveLayer(item,$index)">{{item.Title}}</span>

										<svg class="chevron pull-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
											<path d="M7.065 10l5.014 5 5.013-5z" />
										</svg>

									</div>
									<!-- End First level -->

									<!-- Second level -->
									<ul ng-show="!item.isContainer">
										<div class="legend">
											<img ng-src="{{item.legend}}" legendload />
										</div>
									</ul>
									<ul ng-show="item.isContainer">
										<li ng-repeat="subitem in mc.layers[$index].Layer" ng-class="{'selected': subitem.isActiveLayer}" ng-show="userCanSeeLayer(subitem.Name)">

											<div class="title" id="layout_{{trimSpacesFromLayerName(subitem.Title)}}">
												<div ng-class="{'watching': subitem.isSelected == 1}" class="watchable" ng-click="addRemoveLayer(subitem,$index)">
													<div class="ico-space">
														<svg class="eye" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
															<path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
														</svg>
														<svg class="eye-off" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
															<path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
														</svg>
													</div>
												</div>

												<span class="title-text" ng-click="setActiveLayer(subitem,$index)">{{subitem.Title}}</span>

												<svg class="chevron pull-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
													<path d="M7.065 10l5.014 5 5.013-5z" />
												</svg>

											</div>
											<!-- End Second level -->

											<!-- Third level -->
											<ul ng-show="!subitem.isContainer">
												<div class="legend">
													<img ng-src="{{subitem.legend}}" legendload />
												</div>
											</ul>
											<ul ng-show="subitem.isContainer">
												<li ng-repeat="subsubitem in subitem.Layer" ng-show="userCanSeeLayer(subsubitem.Name)" ng-class="{'selected': subsubitem.isActiveLayer}">

													<div class="title" id="layout_{{trimSpacesFromLayerName(subsubitem.Title)}}">
														<div ng-class="{'watching': subsubitem.isSelected == 1}" class="watchable" ng-click="addRemoveLayer(subsubitem,$index)">
															<div class="ico-space">
																<svg class="eye" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
																	<path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
																</svg>
																<svg class="eye-off" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
																	<path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" />
																</svg>
															</div>
														</div>

														<span class="title-text" ng-click="setActiveLayer(subsubitem,$index)">{{subsubitem.Title}}</span>

														<svg class="chevron pull-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
															<path d="M7.065 10l5.014 5 5.013-5z" />
														</svg>
													</div>

													<!-- Fourth level -->
													<ul>
														<div class="legend">
															<img ng-src="{{subsubitem.legend}}" legendload />
														</div>
													</ul>
													<!-- End fourth level -->
												</li>
											</ul>
											<!-- End Third level -->
										</li>
									</ul>
								</li>
							</ul>
						</div>

					</div>
				</li>

				<li>
					<a href="#">
						<div class="col col-1"><img src="img/ic/settings.svg" class="svg ico" /></div>
						<div class="col col-2"><?php echo CONFIGURATION; ?></div>
						<div class="col col-3"><img src="img/ic/chevron-right.svg" class="svg chevron pull-right" /></div>
					</a>
					<!-- Configuración CONTAINER -->
					<div class="content">
						<div class="toc-config">
							<div class="form">
								<div class="form-component form-component--key-value" ng-show="mc.use_second_background">
									<label for="background"><?php echo SECOND_BACKGROUND; ?></label>
									<select id="background_layer" ng-model="mc.second_background" ng-change="changeBackgroundMap('secondary')" data-ng-options="item.id as item.name for item in mc.available_bg_layers">
									</select>
								</div>

								<div class="form-component form-component--key-value">
									<label for="background"><?php echo BACKGROUND; ?></label>
									<select id="background_layer" ng-model="mc.backgroundmap" ng-change="changeBackgroundMap('main')" data-ng-options="item.id as item.name for item in mc.available_bg_layers">
									</select>
								</div>
								<div class="form-control" ng-show="mc.show_use_tiled_background">
									<label for="blankCheckbox"><?php echo USE_TILED_BACKGROUND; ?></label>
									<input type="checkbox" id="blankCheckbox" value="option1" ng-model="mc.use_tiled_background" ng-change="toogleUseTiledBackground()"> <?php echo USE_TILED_BACKGROUND; ?>
								</div>
								<div class="form-component form-component--key-value" ng-show="mc.use_tiled_background && mc.available_tiled_layers.length>1 ">
									<label for="background"><?php echo TILED; ?></label>
									<select ng-model="mc.selected_tiled" ng-change="changeBackgroundTiled()" data-ng-options="item.id as item.label for item in mc.available_tiled_layers">
									</select>
								</div>
								<div class="form-control">
									<label for="blankCheckbox"><?php echo GEOLOCATION; ?></label>
									<input type="checkbox" id="blankCheckbox" value="option1" ng-model="mc.geolocate" ng-true-value="1" ng-false-value="0" ng-change="toogleGeolocation()"> <?php echo USE_GEOLOCATION; ?>
								</div>
								<div class="form-control">
									<label for="blankCheckbox"><?php echo VISUALIZATION; ?></label>
									<input type="checkbox" id="blankCheckbox" value="" ng-model="mc.showScale" ng-change="toggleScale()"> <?php echo SHOW_SCALE; ?>
									<br />
									<?php if (!$touchDevice) { ?>
										<input type="checkbox" id="blankCheckbox" value="" ng-model="mc.showCoordinates" ng-change="toggleCoordinates()"> <?php echo SHOW_COORDINATES; ?>
									<?php } ?>
								</div>
								<div class="form-control">
									<label for="blankCheckbox"><?php echo PHOTOS_RESOLUTION; ?></label>
									<input type="checkbox" id="PhotosLowResolution" value="" ng-model="mc.PhotosLowResolution"> <?php echo UPLOAD_PHOTOS_LOW_RESOLUTION; ?>
								</div>


							</div>
						</div>
					</div>
					<!-- END Configuración CONTAINER -->
				</li>

				<!-- OFFLINE -->
				<li ng-show="mc.offlineActivated">
					<a href="#">
						<div class="col col-1"><img src="img/ic/offline.svg" class="svg ico" /></div>
						<div class="col col-2">OFFLINE</div>

						<div class="col col-3"><img src="img/ic/chevron-right.svg" class="svg chevron pull-right" /> <img ng-if="mc.offline_reminder==true" src="img/ic/icon_reminder.png" class="svg chevron pull-right" widh="24" height="24" /></div>
					</a>

					<div class="content">
						<div class="toc-config">
							<div class="form">

								<div class="form-control">
									<label for="download"><?php echo DOWNLOAD; ?> <?php echo BACKGROUND; ?>/<?php echo LAYERS; ?></label>
									<div class="form-group">
										<div class="form-component form-component--equal-buttons-row">
											<button ng-show="mc.selectAreaToDownloadButton" ng-class="{'btn-success': mc.selectingArea == true}" type="button" class="btn btn-primary-custom" ng-click="offlineSelectAreaToDownload()"><?php echo OFFLINE_SELECT_AREA; ?></button>
										</div>
										<div class="form-component form-component--equal-buttons-row">
											<button type="button" ng-show="mc.startDownloadBackgroundButton" class="btn btn-primary-custom" ng-click="offlineStartDownloadBackground(1)"><?php echo OFFLINE_DOWNLOAD_BACKGROUND; ?></button>
										</div>
										<div class="form-component form-component--equal-buttons-row">
											<button type="button" ng-show="!mc.offline_downloading_status && mc.startDownloadLayersButton" class="btn btn-primary-custom" ng-click="offlineDownloadLayers(1)"><?php echo OFFLINE_DOWNLOAD_LAYERS; ?></button>
										</div>
										<div class="form-component form-component--equal-buttons-row" ng-show="mc.visit_offline">
											<button type="button" ng-show="!mc.offline_downloading_status && mc.startDownloadLayersButton" class="btn btn-primary-custom" ng-click="offlineDownloadForms()">Descargar forms</button>
										</div>
										<span ng-show="mc.offline_downloading_status"><?php echo DOWNLOADING; ?></span>
									</div>
								</div>
								<div class="form-control" ng-show="mc.deleteVisitsButton || mc.pendingDumpButton">
									<label for="download"><?php echo OFFLINE_DATA; ?></label>
									<div class="form-group">
										<div class="form-component form-component--equal-buttons-row">
											<button ng-show="mc.deleteVisitsButton" type="button" class="btn btn-primary-custom" ng-click="clearOfflineVisits()"><?php echo OFFLINE_REMOVE_STORED_VISIST; ?></button>
										</div>
										<div class="form-component form-component--equal-buttons-row">
											<button ng-show="mc.pendingDumpButton" type="button" class="btn btn-primary-custom" ng-click="offlineDumpData()"><?php echo OFFLINE_DUMP_DATA; ?></button>
										</div>
									</div>

								</div>

								<div class="form-control" ng-show="mc.visit_offline">
									<label for="download">Info</label>
									<div class="form-group">
										<div class="form-control" ng-show="mc.visited_spots_layer">
											<input type="checkbox" id="offlineVisitedSpots" value="option1" ng-model="mc.offlineVisitedSpots" ng-true-value="1" ng-false-value="0" ng-change="toggleVisitedSpots()"> <?php echo SHOW_OFFLINE_VISITED_SPOTS; ?>
										</div>
									</div>
								</div>


							</div>
						</div>
					</div>

				</li>

				<!-- END OFFLINE -->
				<!-- REAL TIME USERS -->
				<!--
				<li>
					<a href="#">
						<div class="col col-1"><img src="img/ic/ic-users.svg" class="svg ico" /></div>
						<div class="col col-2">USERS</div>
						<div class="col col-3"><img src="img/ic/chevron-right.svg" class="svg chevron pull-right" /></div>
					</a>
					<div class="content">
						<div class="toc-config">
							<div class="form">
								<label><?php echo CONFIGURATION; ?></label>
								<div class="form-control">
									<input type="checkbox" id="blankCheckbox" value="option1" ng-model="mc.usersNotifications" ng-change="toogleUsersNotifications()"> <?php echo VIEW_USERS_NOTICATIONS; ?><br>
									<input type="checkbox" id="blankCheckbox" value="option1" ng-model="mc.usersUbication" ng-change="toogleUsersUbication()"> <?php echo VIEW_USERS_UBICATION; ?>
								</div>
								<div class="toc-layouts">
									<label><?php echo CONNECTED_USERS; ?></label>
									<ul>
										<li ng-repeat="item in mc.realTimeusers" >
											<div class="title">
												<div>
													<div class="ico-space">
														<img src="img/ic/remoteLocalize.svg" ng-click="stopLocalizeUser(item.socket_id)" ng-show="item.localized && mc.me!=item.socket_id"/>
														<img src="img/ic/remoteStartLocalize.svg" ng-click="remoteLocalizeUser(item)" ng-show="!item.localized && mc.me!=item.socket_id"/>
														<img src="img/ic/user.svg"  width="18" height="18" ng-show="mc.me==item.socket_id"/>
													</div>
												</div>
												<span class="title-text" ng-click="remoteLocalizeUser(item)">{{item.userName}}</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</li>
			-->
				<!-- END REAL TIME USERS -->
				<!-- DEBUG -->
				<li ng-show="mc.debug==1">
					<a href="#">
						<div class="col col-1"><img src="img/ic/bug.svg" class="svg ico" /></div>
						<div class="col col-2">DEBUG</div>
						<div class="col col-3"><img src="img/ic/chevron-right.svg" class="svg chevron pull-right" /></div>
					</a>
					<div class="content">
						<div class="toc-config">
							<div class="form">
								<div class="form-control">
									<label for="download">Info</label>
									<div class="form-group">
										<p>
											Controller v.{{mc.controllerVersion}}<br>
											Forms v.{{mc.formVersion}}<br><br>
											Project ID: <b><?php echo $project_id; ?></b><br>
											Project Name: <b><?php echo $Project_name; ?></b><br>
											Project Schema: <b><?php echo $project_schema; ?></b><br>
											Info type: <b><?php echo $info_type; ?></b><br>
											Skin: <b><?php echo $project_skin; ?></b><br>
											User: <b><?php echo $userName; ?></b>
										</p>
									</div>
								</div>
								<label>OFFLINE</label>
								<div class="form-component form-component--equal-buttons-row">
									<button ng-show="mc.showSavedAreasButton" ng-class="{'btn-success': mc.showingSavedAreas == true}" type="button" class="btn btn-primary-custom" ng-click="offlineShowSavedAreas()"><?php echo OFFLINE_SHOW_SAVED_AREA; ?></button>
								</div>
								<div class="form-component form-component--equal-buttons-row">
									<button type="button" class="btn btn-primary-custom" ng-class="{'btn-success': mc.offlineForced == true}" ng-click="toggleOffline()"><?php echo OFFLINE_FORCE; ?></button>
								</div>
								<div class="form-control">
									<p ng-show="mc.storedBackGroundDate && mc.storedBackGroundDate!='NaN/NaN/NaN NaN:NaN'">
										<?php echo OFFLINE_BACKGROUND_STORED_DATE; ?>: {{mc.storedBackGroundDate}}
									</p>
									<p ng-show="mc.storedGeoJSONDate && mc.storedGeoJSONDate!='NaN/NaN/NaN NaN:NaN'">
										<?php echo OFFLINE_GEOJSON_STORED_DATE; ?>: {{mc.storedGeoJSONDate}}
									</p>
									<p ng-show="mc.visitsStoredNumber">
										<?php echo OFFLINE_VISITS_STORED_DATE; ?>: {{mc.visitsStoredNumber}}
									</p>
									<p ng-show="mc.visitsDate">
										<?php echo OFFLINE_VISITS_STORED; ?>: {{mc.visitsDate}}
									</p>
									<p ng-show="mc.usedPercentage">
										<?php echo OFFLINE_PERCENTAGE_USED_SPACE; ?>: {{mc.usedPercentage}}%
									</p>
								</div>
								<div class="form-component form-component--equal-buttons-row">
									<button type="button" class="btn btn-primary-custom" ng-click="offlineReset()"><?php echo OFFLINE_RESET; ?></button>
								</div>
							</div>
						</div>
				</li>
				<!-- END DEBUG -->
				<li>
					<a href="<?php echo $baseHref; ?>home.php">
						<div class="col col-1"><img src="img/ic/arrow-left.svg" class="svg ico" /></div>
						<div class="col col-2">Home</div>
					</a>
				</li>
			</ul>
			<ul>

				<li>
					<a href="<?php echo $baseHref; ?>logout.php">
						<div class="col col-1"><img src="img/ic/power.svg" class="svg ico" /></div>
						<div class="col col-2">Logout</div>
					</a>
				</li>
			</ul>

		</div>
	</div>

	<div class="menu-tools">
		<a href="#" class="menu-toggle closed" id="menuToolsMobile">
			<img src="img/ic/tools.svg" class="svg hamburger" />
			<img src="img/ic/times.svg" class="svg times" />
		</a>
		<ul class="tools closed">
			<!-- Visits -->
			<li ng-show="mc.btVisits"><button-visits tooltip="<?php echo VISITS; ?>" ng-click="gwGetVisit('visit')"></button-visits></li>
			<li ng-show="mc.btIncidence"><button-incidence tooltip="<?php echo INCIDENCE; ?>" ng-click="gwGetVisit('incidence')"></button-incidence></li>
			<li ng-show="mc.btVisitManager"><button-visit-manager tooltip="<?php echo VISIT_MANAGER; ?>" ng-click="gwGetVisitManager()"></button-visit-manager></li>
			<!-- selector de explotaciones y estados -->
			<li ng-show="mc.btFilter">
				<button-filter ng-disabled="filtersDisabled" ng-click="getFormFilters()" tooltip="<?php echo FILTERS; ?>"></button-filter>
			</li>
			<!-- FIN selector de explotaciones y estados -->
			<!-- Search -->
			<li ng-show="mc.btSearch">
				<button-search ng-click="getSearchForm()" ng-show="mc.btSearch" tooltip="<?php echo SEARCH; ?>"></button-search>
			</li>
			<!-- Fin Search -->
			<!-- Icono "geolocalizador" -->
			<li ng-show="mc.btGeolocalize"><track-position tooltip="<?php echo DETECT_POSITION; ?>"></track-position></li>
			<!-- FIN Icono "geolocalizador" -->
			<!-- Icono "Zoom In" -->
			<li ng-show="mc.btZoomIn"><zoom-in tooltip="<?php echo ZOOM_IN; ?>"></zoom-in></li>
			<!-- FIN Icono "Zoom In" -->
			<!-- Icono "Zoom out" -->
			<li ng-show="mc.btZoomOut"><zoom-out tooltip="<?php echo ZOOM_OUT; ?>"></zoom-out></li>
			<!-- FIN Icono "Zoom in" -->
			<!-- Icono "Zoom extension" -->
			<li ng-show="mc.btFit"><zoom-extent tooltip="<?php echo ZOOM_TO_EXTENT; ?>"></zoom-extend></li>
			<!-- FIN Icono "Zoom extension" -->
			<!-- Icono "Añadir punto" -->
			<li ng-show="mc.btAddPoint"><add-point tooltip="<?php echo TOOL_ADD_POINT; ?>"></add-point></li>
			<!-- FIN Icono "Añadir punto" -->
			<!-- Icono "Añadir arco" -->
			<li ng-show="mc.btAddLine"><add-line tooltip="<?php echo TOOL_ADD_LINE; ?>"></add-line></li>
			<!-- FIN Icono "Añadir arco" -->
			<!-- Icono "bt Polygon" -->
			<li ng-show="mc.btAddPolygon"><add-polygon tooltip="<?php echo TOOL_ADD_POLYGON; ?>"></add-polygon></li>
			<!-- FIN Icono "bt Polygon" -->
			<!-- Icono "bt go2epa" -->
			<li ng-show="mc.btGo2epa"><button-go2epa tooltip="" ng-click="go2epa()"></button-go2epa></li>
			<!-- FIN Icono "bt go2epa" -->
			<!-- Icono "bt access control" -->
			<li ng-show="mc.btAccessControl"><button-Access-Control tooltip="<?php echo CONTROL_ACCESS; ?>" ng-click="openAccessControlForm()"></button-Access-Control></li>
			<!-- FIN Icono "bt access control" -->
			<!-- Icono "Flow trace" 
			<li ng-show="mc.btFlowTrace">
				<up-stream tooltip="Upstream" id="upmobile"></up-stream>
			</li>
			 FIN Icono "Flow trace" -->
			<!-- Icono "Flow exit" 
			<li ng-show="mc.btFlowTrace">
				<down-stream tooltip="Downstream" id="downmobile"></down-stream>
			</li>
			 FIN Icono "Flow exit" -->
			<!-- Icono "New mincut" -->
			<li ng-show="mc.btMincut"><new-mincut tooltip="Mincut"></new-mincut></li>
			<!-- FIN Icono "End new mincut" -->
			<!-- Icono "Mincut management" -->
			<li ng-show="mc.btMincut"><manage-mincut tooltip="<?php echo MANAGE_MINCUT; ?>"></manage-mincut></li>
			<!-- FIN Icono "Mincut management" -->
			<!--  Icono "Multiple select" -->
			<li ng-show="mc.btmultipleSelect">
				<multiple-select tooltip=""></multiple-select>
			</li>
			<!-- FIN Icono "Multiple select" -->
			<!--  Icono "Polygon select" -->
			<li ng-show="mc.btpolygonSelect">
				<polygon-select tooltip=""></polygon-select>
			</li>
			<!-- FIN Icono "Multiple select" -->
			<!--  Icono "Multiple Update" -->
			<li ng-show="mc.btMultiupdate">
				<button-multi-update tooltip="multiple update" ng-click="multiUpdate()"></button-multi-update>
			</li>
			<!-- FIN Icono "Multiple Update" -->
			<!-- imprimir mapa -->
			<li ng-show="mc.btPrint">
				<button-print ng-click="getPrint()" ng-show="mc.btPrint" tooltip="<?php echo PRINT_STR; ?>"></button-print>
			</li>
			<!-- fin imprimir mapa -->
			<!-- date selector -->
			<li ng-show="mc.btDateSelector">
				<button-date-selector ng-click="getDatesForm()" tooltip="<?php echo DATE_SELECTOR; ?>"></button-date-selector>
			</li>
			<!-- fin date selector -->

		</ul>
	</div>

	<div id="map"></div>
	<div class="ol-scale-coordinates">


		<div id="myposition" class="coordinates"></div>
		<div id="units" class="scale-line"></div>
	</div>

	<div ng-show="mc.btEndGeometry" class="snackbar-buttons" ng-class="{'visible': mc.btEndGeometry == 1}">
		<!-- Botón done para edición/add de geometrias -->
		<button class="btn btn-accent" ng-click="endGeometry()" ng-show="mc.btEndGeometry">
			<?php echo DONE; ?>
		</button>
		<!-- Botón done para edición/add de geometrias -->
		<!-- Botón cancel para edición/add de geometrias -->
		<button class="btn btn-default-light" ng-click="cancelGeometry()" ng-show="mc.btEndGeometry">
			<?php echo CANCEL; ?>
		</button>
		<!-- Botón cancel para edición/add de geometrias -->
	</div>

	<div ng-show="mc.btEndBlockAction" class="snackbar-buttons" align="center" ng-class="{'visible': mc.btEndBlockAction == 1}">
		<!-- Botón cancel para edición/add de geometrias -->
		<button class="btn btn-default-light" ng-click="cancelAction()">
			<?php echo CANCEL; ?>
		</button>
		<!-- Botón cancel para edición/add de geometrias -->
	</div>



	<div class="forms-area">

		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************          FormInfo      ***************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<div class="drop-down-form" ng-class="{'visible': mc.formInfo == 1}">
			<div class="header">
				<div class="title">
					<div class="ico-area">
						<img src="img/ic/form-title-1.svg" />
					</div>
					<span class="title-area">{{mc.debugFormName}}</span>
					<div class="buttons-area">
						<a ng-show="mc.linkPath" ng-href="{{mc.linkPath}}" target="_blank"><img src="img/ic/ic_dropdown-form-link.svg" alt="Link" /></a>
						<!-- Botón cerrar siempre visible -->
						<button ng-click="closePointInfo()"><img src="img/ic/ic_dropdown-form-close.svg" alt="<?php echo CLOSE; ?>" /></button>
						<!-- Botón cerrar siempre visible -->
					</div>
				</div>
				<div class="tabs">
					<ul>
						<li class="active"><button>{{getTabLabel('tabInfo')}}</button></li>
						<li ng-if="mc.tabElement"><button ng-click="getWebForms(mc.elementSelectorForWebForms,'element_f11','element_options_f11','tabElement')">{{getTabLabel('tabElement')}}</button></li>
						<li ng-if="mc.tabHydro"><button ng-click="getWebForms(mc.elementSelectorForWebForms,'element_f11','element_options_f11','tabHydro')">{{getTabLabel('tabHydro')}}</button></li>
						<li ng-if="mc.tabConnect"><button ng-click="getConnect()">{{getTabLabel('tabConnect')}}</button></li>
						<li ng-if="mc.tabMincut"><button ng-click="getInfoMincut()">{{getTabLabel('tabMincut')}}</button></li>
						<li ng-if="mc.tabVisit"><button ng-click="getVisitWebForms(mc.visitSelectorForWebForms,'visitData','visitData_options')">{{getTabLabel('tabVisit')}}</button></li>
						<li ng-if="mc.tabDoc"><button ng-click="getWebForms(mc.docSelectorForWebForms,'doc_f11','doc_options_f11')">{{getTabLabel('tabDoc')}}</button></li>
						<li ng-if="mc.tabFiles"><button ng-click="getTabFiles(mc.visitSelectorForWebForms)">{{getTabLabel('tabFiles')}}</button></li>
					</ul>
				</div>
			</div>

			<div class="content">

				<div class="tab-content">

					<!-- Events form f22, f23, f24-->
					<div ng-show="mc.tabEvent_standard || mc.tabEvent_ud_arc_rehabit || mc.tabEvent_ud_arc_standard">

						<div ng-repeat="item in mc.fields">
							<form-text data="{{item}}" ng-model="item.name" ng-if="item.type=='text'"></form-text>
							<form-combo data="{{item}}" ng-model="item.name" ng-if="item.type=='combo'"></form-combo>
							<form-area data="{{item}}" ng-model="item.name" ng-if="item.type=='textarea'"></form-area>
						</div>
						<div class="form-component form-component--photo-gallery three-cols" ng-show="mc.pointPhotos.length>0">

							<div class="spacer-15"></div>
							<label>Gallery</label>
							<div class="spacer-5"></div>

							<ul class="">
								<li ng-repeat="item in mc.pointPhotos">
									<div class="photo" ng-click="showPhoto(item.photo_id)">
										<!-- Aquí un <img ng-click="showPhoto(item.photo_id)"> -->
									</div>
									<div class="footer">
										<button ng-click="deleteImg(item.photo_id)"><img src="img/ic/ic_gallery-item-delete.svg" /></button>
									</div>
								</li>
							</ul>

						</div>

						<!-- botón add para añadir evento solo visible si mc.event_id = null -->
						<button class="btn btn-default-light" ng-show="mc.event_id==null && mc.layerVisitable" ng-click="submitEvent()">
							<?php echo ADD; ?>
						</button>
						<button class="btn btn-default-light" ng-show="mc.event_id!=null && mc.layerVisitable" ng-click="deleteEvent()">
							<?php echo DELETE; ?>
						</button>
					</div>
					<!-- FIN Events form F22, F23, F24-->

					<!-- Gallery form F27-->
					<div ng-show="mc.tabGallery">

						<div class="form-component form-component--photo-gallery two-cols">

							<label>Gallery</label>
							<div class="spacer-5"></div>

							<ul class="">
								<li ng-repeat="item in mc.gallery">
									<div class="photo" ng-click="showPhoto(item)">
										<!-- <img src="http://getbootstrap.com/assets/img/bootstrap-stack.png" /> -->
									</div>
									<div class="footer">
										<button ng-click="showPhoto(item)"><img src="img/ic/ic_gallery-item-view.svg" /></button>
										<button ng-click="deletePhoto(item)" ng-show="mc.layerVisitable"><img src="img/ic/ic_gallery-item-delete.svg" /></button>
									</div>
								</li>
							</ul>

							<div ng-show="mc.gallery.length<1"><?php echo NO_PHOTOS; ?></div>
						</div>

					</div>
					<!-- FIN Gallery form F27-->

					<!--  ADD Visit form F21 -->
					<div ng-show="showInput(mc.formId,'btDelete') && userCanEditLayer()">
						<button class="btn btn-default-light" ng-show="showInput(mc.formId,'btDelete')">
							<?php echo DELETE; ?>
						</button>
						<div class="form-component form-component--divider"></div>
					</div>

					<div ng-show="showInput(mc.formId,'select_visitcat_id') || showInput(mc.formId,'code')">
						<div class="form-component form-component--equal-columns-row">
							<div ng-show="showInput(mc.formId,'select_visitcat_id')" class="form-component form-component--label-and-input">
								<label>Visitcat_ID</label>
								<select id="visitcat_id" ng-model="mc.visitcat_id" ng-change="updateVisit('visitcat_id',mc.visitcat_id)" data-ng-options="item.id as item.name for item in mc.visitcat_id_options">
								</select>
							</div>
							<div ng-show="showInput(mc.formId,'code')" class="form-component form-component--label-and-input">
								<label>Code</label>
								<input type="text" ng-model="mc.code" ng-blur="updateVisit('ext_code',mc.code)">
							</div>
						</div>
						<div class="form-component form-component--divider-huge"></div>
					</div>


					<div ng-show="showInput(mc.formId,'checkVisitDone') || showInput(mc.formId,'checkVisitSuspended')">
						<div class="form-component form-component--equal-columns-row">
							<div ng-show="showInput(mc.formId,'checkVisitDone')">
								<input type="checkbox" id="visit_done" ng-model="mc.visit_done" ng-value="1" ng-click="clickRadioVisitIsDone(1)" />
								<label for="visit_done"><?php echo DONE; ?></label>
							</div>
							<div ng-show="showInput(mc.formId,'checkVisitSuspended')">
								<input type="checkbox" id="visit_suspended" ng-model="mc.visit_suspended" ng-value="1" ng-click="clickRadioVisitIsDone(0)" />
								<label for="visit_suspended"><?php echo SUSPENDED; ?></label>
							</div>
						</div>

						<div class="form-component form-component--divider"></div>
					</div>
					<div class="form-component form-component--list-box" ng-show="showInput(mc.formId,'tableViewEvents')">
						<label><?php echo EVENTS; ?></label>
						<ul ng-show="mc.events.length>0">
							<li ng-repeat="item in mc.events" ng-dblclick="getEvent(item.sys_id)">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>
						</ul>
						<div ng-show="mc.events.length==0">
							NO EVENTS
						</div>
					</div>
					<!-- parameter_type and parameter_id for adding event -->
					<div ng-show="showInput(mc.formId,'parameter_id') || showInput(mc.formId,'parameter_type')">
						<div class="form-component form-component--equal-columns-row">
							<div class="form-component form-component--label-and-input">
								<label ng-show="showInput(mc.formId,'parameter_type')"><?php echo PARAMETER_TYPE; ?></label>
								<select id="parameter_type" ng-model="mc.parameter_type" ng-change="changeParameterType()" data-ng-options="item.id as item.name for item in mc.parameter_type_options">
								</select>
							</div>

							<div ng-show="showInput(mc.formId,'parameter_id')" class="form-component form-component--label-and-input">
								<label><?php echo PARAMETER_ID; ?></label>
								<select id="parameter_id" ng-model="mc.parameter_id" data-ng-options="item.id as item.name for item in mc.parameter_id_options">
								</select>
							</div>
						</div>
						<div class="form-component form-component--divider"></div>
					</div>
					<!-- bt add event -->
					<button class="btn btn-default-light" ng-show="showInput(mc.formId,'btAdd')" ng-click="addEvent()">
						<?php echo ADD_EVENT; ?>
					</button>
					<!--  FIN Pestaña Visit form F21 -->
					<!-- Visit manager f25-->
					<div ng-show="mc.formId=='F25'">
						<div class="form-component form-component--equal-columns-row">
							<div class="form-component form-component--label-and-input">
								<label><?php echo FROM; ?>:</label>
								<!-- DATEPICKER -->
								<input type="text" id="dp_visit_manager_from" readonly ng-model="dp_visit_manager_from" ng-change="getVisitsFromFeature()">
							</div>
							<div class="form-component form-component--label-and-input">
								<label><?php echo TO; ?>:</label>
								<!-- DATEPICKER -->
								<input type="text" id="dp_visit_manager_to" readonly ng-model="dp_visit_manager_to" ng-change="getVisitsFromFeature()">
							</div>
						</div>

						<div class="form-component form-component--select-multiple">
							<label>aa<?php echo VISITS; ?></label>
							<ul>
								<li ng-repeat="item in mc.visitData_options" id="li_visit_{{$index}}" ng-click="selectVisit(item.sys_id)">
									<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
									<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)"><b>{{key}}</b>: {{value}}<br /></span>
								</li>
							</ul>
						</div>
						<button class="btn btn-default-light" ng-click="deleteVisit()" ng-show="userCanEditLayer()"><?php echo DELETE; ?></button>
					</div>
					<!-- END Visit manager f25-->

					<!--  Pestaña tabInfo, atributos de un elemento del mapa -F11 genérico y otros genéricos-->
					<span ng-show="mc.tabInfo">

						<div class="form-component form-component--equal-buttons-row" ng-show="mc.editBt">
							<!-- Botón edit geometry -->
							<button class="btn btn-default-light" ng-click="editGeometry()" nng-show="mc.pol_id!=null">
								<?php echo EDIT_GEOMETRY; ?>
							</button>
							<!-- Botón edit geometry -->
							<!-- Botón Delete -->
							<button class="btn btn-default-light" ng-click="deleteFeature()" ng-show="mc.pol_id!=null">
								<?php echo DELETE; ?>
							</button>
						</div>

						<div class="form-component form-component--equal-columns-row" ng-repeat="item in mc.edit_feature_form" ng-show="item.name != 'geometry' && mc.edit_feature_form.length>0">
							<form-text data="{{item}}" ng-model="item.name" ng-if="item.type=='text' && displayAttribute(item.name)"></form-text>
							<form-hidden data="{{item}}" ng-model="item.name" ng-if="item.type=='hidden'"></form-hidden>
							<form-combo data="{{item}}" ng-model="item.name" ng-if="item.type=='combo' && displayAttribute(item.name)"></form-combo>
							<form-area data="{{item}}" ng-model="item.name" ng-if="item.type=='textarea' && displayAttribute(item.name)"></form-area>
							<form-check data="{{item}}" ng-model="item.name" ng-if="item.type=='check' && displayAttribute(item.name)"></form-check>
							<form-datepicker data="{{item}}" ng-model="item.name" ng-if="item.type=='datepicker' && displayAttribute(item.name)"></form-datepicker>
							<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button' && displayAttribute(item.name)"></form-button>
							<form-list data="{{item}}" ng-if="item.type=='list' && displayAttribute(item.name)"></form-list>
							<form-datepickertime data="{{item}}" ng-model="item.name" ng-if="item.type=='datepickertime' && displayAttribute(item.name)"></form-datepickertime>
							<form-typeahead data="{{item}}" ng-model="item.name" ng-if="item.type=='typeahead' && displayAttribute(item.name)"></form-typeahead>
							<form-divider data="{{item}}" ng-model="item.name" ng-if="item.type=='formDivider' && displayAttribute(item.name)"></form-divider>

						</div>
						<div class="form-component form-component--key-value" ng-repeat="item in mc.pointAttributtes" ng-show="item.name != 'geometry' && mc.edit_feature_form.length==0">
							<!-- Si ponemos el title al label, aparecerá el titulo
							completo al mantener el cursor encima, por si no
							cabe completo y está cortado con ... -->
							<label title="{{item.name}}">{{item.name}}:</label>
							<input type="text" value="{{item.value}}" disabled='true' />
						</div>

					</span>

					<!--  FIN Pestaña tabInfo, atributos de un elemento del mapa -->







				</div>

				<div class="tab-content" ng-if="mc.tabElement">
					<!-- Pestaña Element -->
					<div class="form-component form-component--select-multiple">
						<label>{{getTabText('tabElement')}}</label>
						<ul>
							<li ng-repeat="item in mc.element_options_f11">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)" ng-dblclick="getElement(item)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>

						</ul>
					</div>
				</div>




				<div class="tab-content" ng-if="mc.tabHydro">
					<!-- Pestaña Hydro -->
					<div class="form-component form-component--select-multiple">
						<label>{{getTabText('tabHydro')}}</label>
						<ul>
							<li ng-repeat="item in mc.element_options_f11">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)" ng-dblclick="getElement(item)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>

						</ul>
					</div>
					<!-- END Pestaña Hydro -->
				</div>

				<div class="tab-content" ng-if="mc.tabConnect">
					<!-- Pestaña Connect -->
					<!-- solo mostrar para el form F13 -->
					<div class="form-component form-component--equal-buttons-row" ng-show="showInput(mc.formId,'btsConnectNode')">
						<button class="btn btn-default-light" ng-click="openConnect(mc.node1)" ng-show="mc.node1">Node 1</button>
						<button class="btn btn-default-light" ng-click="openConnect(mc.node2)" ng-show="mc.node2">Node 2</button>
					</div>

					<div class="form-component form-component--select-multiple" ng-show="!showInput(mc.formId,'btsConnectNode') && mc.upstream_options.length>0">
						<label>{{mc.upstream_label}}</label>
						<ul>
							<li ng-repeat="item in mc.upstream_options" ng-dblclick="openConnect(item)">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>
						</ul>
					</div>

					<div class="form-component form-component--select-multiple" ng-show="!showInput(mc.formId,'btsConnectNode') && mc.downstream_options.length>0">
						<label>{{mc.downstream_label}}</label>
						<ul>
							<li ng-repeat="item in mc.downstream_options" ng-dblclick="openConnect(item)">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>
						</ul>

					</div>
					<div class="form-component form-component--select-multiple" ng-show="showInput(mc.formId,'btsConnectNode') && mc.connect_related_options">
						<label>{{getTabText('tabConnect')}}</label>
						<ul>
							<li ng-repeat="item in mc.connect_related_options">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)" ng-dblclick="openConnect(item)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>
						</ul>
					</div>

				</div>
				<div class="tab-content" ng-if="mc.tabMincut">
					<!-- Pestaña Mincut -->
					<div class="form-component form-component--equal-columns-row">
						<div class="form-component form-component--label-and-input">
							<label><?php echo FROM; ?>:</label>
							<!-- DATEPICKER -->
							<input type="text" id="dp_mincut_from" readonly ng-model="dp_mincut_from" ng-change="getInfoMincut()">
						</div>
						<div class="form-component form-component--label-and-input">
							<label><?php echo TO; ?>:</label>
							<!-- DATEPICKER -->
							<input type="text" id="dp_mincut_to" readonly ng-model="dp_mincut_to" ng-change="getInfoMincut()">
						</div>
					</div>

					<div class="form-component form-component--divider"></div>

					<div class="form-component form-component--select-multiple">
						<label>{{getTabLabel('tabMincut')}}</label>
						<ul>
							<li ng-repeat="item in mc.mincutData" ng-dblclick="getMincut(item.sys_id)">
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>
						</ul>
					</div>
					<div class="form-component form-component--divider"></div>
					<!-- END Pestaña Mincut -->
				</div>
				<div class="tab-content" ng-if="mc.tabVisit">
					<!-- Pestaña VISIT -->
					<div class="form-component form-component--equal-columns-row">
						<div class="form-component form-component--label-and-input">
							<label><?php echo FROM; ?>:</label>
							<!-- DATEPICKER -->
							<input type="text" id="dp_visit_from" readonly ng-model="dp_visit_from" ng-change="getVisitWebForms(mc.visitSelectorForWebForms,'visitData','visitData_options')">
						</div>
						<div class="form-component form-component--label-and-input">
							<label><?php echo TO; ?>:</label>
							<!-- DATEPICKER -->
							<input type="text" id="dp_visit_to" readonly ng-model="dp_visit_to" ng-change="getVisitWebForms(mc.visitSelectorForWebForms,'visitData','visitData_options')">
						</div>
					</div>

					<div class="form-component" v-show="mc.visitData_filters">
						<div class="form-component form-component--label-and-input" ng-repeat="item in mc.visitData_filters">
							<form-combo data="{{item}}" ng-model="mc.visit_filters[item.name]" style="null"></form-combo>
						</div>

					</div>

					<div class="form-component form-component--divider" ng-show="mc.visitData_options['gallery'] || mc.visitData_options['document']"></div>
					<button class="btn btn-default-light" ng-show="mc.visitData_options['document']"><?php echo DOCUMENT; ?></button>

					<div class="form-component form-component--divider"></div>

					<div class="form-component form-component--select-multiple">
						<label><?php echo VISITS; //antes era EVENTS; 
								?></label>
						<ul>
							<li ng-repeat="item in mc.visitData_options" ng-dblclick="selectVisit(item.sys_id)">
								<!-- cuando mostraba events<li ng-repeat="item in mc.visitData_options" ng-dblclick="getEvent(item.sys_id)">-->
								<!-- se muestran todos los elementos que vengan en la respuesta, excepto lo que empiezan con sys_,  la clave primaria para ejecutar la acción que pertoque siempre es sys_id-->
								<span ng-repeat="(key, value) in item" ng-if="displayAttribute(key)"><b>{{key}}</b>: {{value}}<br /></span>
							</li>
						</ul>
					</div>
					<!--<div class="form-component form-component--divider"></div>
						<button class="btn btn-default-light" ng-click="openVisitManager()"><?php echo VISIT_MANAGER; ?></button>-->
					<!-- FIN Pestaña VISIT -->
				</div>
				<div class="tab-content" ng-if="mc.tabDoc">
					<!-- Pestaña Docs -->
					<div class="form-component form-component--select-multiple">
						<label>{{getTabText('tabDoc')}}</label>
						<ul>
							<li ng-repeat="item in mc.doc_options_f11">
								<span ng-dblclick="openDoc(item.sys_link)">{{item.doc_id}}</span>
							</li>
						</ul>
					</div>
					<!-- END Pestaña Docs -->
				</div>


				<!-- FILES form -->
				<div class="tab-content" ng-if="mc.tabFiles">
					<div class="form-component form-component--photo-gallery two-cols">
						<div>
							<button ng-click="addPicture('upload')"><img src="img/ic/addFile.svg" alt="item.actionTooltip" /></button>
							<span ng-show="mc.pointPhotos.length>0">({{mc.pointPhotos.length}})</span>
						</div>


						<div class="form-component form-component--equal-columns-row" ng-repeat="item in mc.tabFilesFields">
							<form-text data="{{item}}" ng-model="item.name" ng-if="item.type=='text'"></form-text>
							<form-hidden data="{{item}}" ng-model="item.name" ng-if="item.type=='hidden'"></form-hidden>
							<form-combo data="{{item}}" ng-model="item.name" ng-if="item.type=='combo'"></form-combo>
							<form-area data="{{item}}" ng-model="item.name" ng-if="item.type=='textarea'"></form-area>
							<form-check data="{{item}}" ng-model="item.name" ng-if="item.type=='check'"></form-check>
							<form-datepicker data="{{item}}" ng-model="item.name" ng-if="item.type=='datepicker'"></form-datepicker>
							<form-datepickertime data="{{item}}" ng-model="item.name" ng-if="item.type=='datepickertime'"></form-datepickertime>
							<form-typeahead data="{{item}}" ng-model="item.name" ng-if="item.type=='typeahead'"></form-typeahead>
							<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button'"></form-button>
							<form-divider data="{{item}}" ng-model="item.name" ng-if="item.type=='formDivider'"></form-divider>
							<form-list data="{{item}}" ng-if="item.type=='list' || item.type=='iconList'"></form-list>
						</div>


					</div>

				</div>
				<!-- FIN files form-->
			</div>
			<div class="footer">
				<div class="form-component form-component--equal-buttons-row">
					<!--
					<button class="btn btn-default-light" ng-show="mc.btAddVisit" ng-click="addVisit()">
						<?php echo ADD_VISIT; ?>
					</button>
				-->
					<!-- BT PHOTOS -->
					<button type="button" class="btn" ng-click="addPicture('upload')" ng-show="showInput(mc.formId,'btAddPhoto') && mc.layerVisitable">
						<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
							<path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
						</svg>
					</button>
					<!-- fin botón para subir una foto -->

					<!-- fin BT PHOTOS -->
					<button class="btn btn-default-light" ng-show="showInput(mc.formId,'btViewGallery') && mc.photos.length>0" ng-click="viewGallery('event',mc.event_id)">
						<?php echo VIEW_GALLERY; ?>
					</button>

					<!-- Botón back -->
					<button class="btn btn-default-light" ng-show="showBackBt()" ng-click="backButtonClicked()">
						<?php echo BACK; ?>
					</button>

					<!-- Button add document to element (tabFiles) -->
					<button class="btn btn-default-light" ng-click="setFeatureFile()" ng-show="mc.btAcceptTabFiles">
						<?php echo ACCEPT; ?>
					</button>
				</div>
			</div>
		</div>
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************      FIN FormInfo      ***************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->

		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************     Form add feature   ***************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->

		<div class="drop-down-form" ng-class="{'visible': mc.formAddfeature == 1}">
			<div class="header">
				<div class="title">
					<div class="ico-area">
						<img src="img/ic/form-title-1.svg" />
					</div>
					<span class="title-area"></span>
					<div class="buttons-area">
						<!-- Botón cerrar siempre visible -->
						<button ng-click="closePointInfo()"><img src="img/ic/ic_dropdown-form-close.svg" alt="<?php echo CLOSE; ?>" /></button>
						<!-- Botón cerrar siempre visible -->
					</div>
				</div>

			</div>

			<div class="content">
				<div class="tab-content">
					<div class="form-component form-component--equal-columns-row" ng-repeat="item in mc.add_feature_form">
						<form-text data="{{item}}" ng-model="item.name" ng-if="item.type=='text'"></form-text>
						<form-hidden data="{{item}}" ng-model="item.name" ng-if="item.type=='hidden'"></form-hidden>
						<form-combo data="{{item}}" ng-model="item.name" ng-if="item.type=='combo'"></form-combo>
						<form-area data="{{item}}" ng-model="item.name" ng-if="item.type=='textarea'"></form-area>
						<form-check data="{{item}}" ng-model="item.name" ng-if="item.type=='check'"></form-check>
						<form-datepicker data="{{item}}" ng-model="item.name" ng-if="item.type=='datepicker'"></form-datepicker>
						<form-datepickertime data="{{item}}" ng-model="item.name" ng-if="item.type=='datepickertime'"></form-datepickertime>
						<form-typeahead data="{{item}}" ng-model="item.name" ng-if="item.type=='typeahead'"></form-typeahead>
						<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button'"></form-button>
						<form-divider data="{{item}}" ng-model="item.name" ng-if="item.type=='formDivider'"></form-divider>
						<form-list data="{{item}}" ng-if="item.type=='list' || item.type=='iconList'"></form-list>

					</div>
				</div>
			</div>
			<div class="footer">

				<div class="form-component form-component--equal-buttons-row">

					<!-- Botón Añadir -->
					<button class="btn btn-default-light" ng-click="submitInsertFeatureForm()" ng-show="mc.pol_id==null">
						<?php echo ADD; ?>
					</button>
				</div>
			</div>
		</div>
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************     FIN add feauture   ***************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->

		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************       Form Filters      **************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->

		<div class="drop-down-form" ng-class="{'visible': mc.formFilters == 1}">
			<div class="header">
				<div class="title">
					<div class="ico-area">
						<img src="img/ic/ic_search.svg" ng-show="mc.clickedButton=='search'" />
						<img src="img/ic/form-title-1.svg" ng-show="mc.clickedButton==null" />
						<img src="img/ic/toolbar/AB4.svg" ng-show="mc.clickedButton=='filter'" />
						<img src="img/ic/toolbar/AB3.svg" ng-show="mc.clickedButton=='print'" />
						<img src="img/ic/toolbar/TB32.svg" ng-show="mc.clickedButton=='mincut'" />
						<img src="img/ic/ic_selector_fechas.svg" ng-show="mc.clickedButton=='dateSelector'" />
						<img src="img/ic/toolbar/TB11.svg" ng-show="mc.clickedButton=='visits'" />
						<img src="img/ic/notification.svg" ng-show="mc.clickedButton=='notification'" />
					</div>
					<span class="title-area">{{mc.formName}}</span>
					<div class="buttons-area">
						<a ng-show="mc.notifications==1 && mc.clickedButton=='visits'" ng-click="openNotificationForm()" style="cursor: pointer;"><img src="img/ic/notification.svg" alt="Link" width="18" height="18" /></a>
						<!-- Botón cerrar siempre visible -->
						<button ng-click="closePointInfo()"><img src="img/ic/ic_dropdown-form-close.svg" alt="<?php echo CLOSE; ?>" /></button>
						<!-- Botón cerrar siempre visible -->
					</div>
				</div>
				<div class="tabs">
					<ul>
						<li ng-repeat="tab in mc.filterTabs" ng-class="{'active': tab.active}"><button ng-click="setActiveTab(tab.tabName,tab.tabFunction)">{{tab.tabLabel}}</button></li>
					</ul>
				</div>
			</div>

			<div class="content">
				<div class="tab-content dynamicForm" ng-repeat="tab in mc.filterTabs">
					<div class="form-component form-component--equal-columns-row">
						<span ng-repeat="item in tab.tabActions">
							<button ng-show="item.actionName=='actionAddFile'" ng-click="buttonAction(item.actionFunction)"><img src="img/ic/addFile.svg" alt="item.actionTooltip" /></button>
							<button ng-show="item.actionName=='actionDelete'" ng-click="deleteAction(item)"><img src="img/ic/actionDelete.svg" alt="item.actionTooltip" /></button>
							<button ng-show="item.actionName=='changeAction'"><img src="img/ic/toolbar/TB6.svg" alt="item.actionTooltip" ng-click="selectAction(item)" /></button>
							<button ng-show="item.actionName=='actionLink'"><img src="img/ic/visit_manager.svg" alt="item.actionTooltip" ng-click="buttonAction(item.actionFunction)" /></button>
						</span>
					</div>
					<div class="form-component form-component--equal-columns-row" ng-repeat="item in tab.fields">
						<form-text data="{{item}}" ng-model="item.name" ng-if="item.type=='text'"></form-text>
						<form-hidden data="{{item}}" ng-model="item.name" ng-if="item.type=='hidden'"></form-hidden>
						<form-combo data="{{item}}" ng-model="item.name" ng-if="item.type=='combo'"></form-combo>
						<form-area data="{{item}}" ng-model="item.name" ng-if="item.type=='textarea'"></form-area>
						<form-check data="{{item}}" ng-model="item.name" ng-if="item.type=='check'"></form-check>
						<form-datepicker data="{{item}}" ng-model="item.name" ng-if="item.type=='datepicker'"></form-datepicker>
						<form-datepickertime data="{{item}}" ng-model="item.name" ng-if="item.type=='datepickertime'"></form-datepickertime>
						<form-typeahead data="{{item}}" ng-model="item.name" ng-if="item.type=='typeahead'"></form-typeahead>
						<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button' && item.position=='body'" class="fullWidth"></form-button>
						<form-divider data="{{item}}" ng-model="item.name" ng-if="item.type=='formDivider'"></form-divider>
						<form-list data="{{item}}" ng-if="item.type=='list' || item.type=='iconList'"></form-list>
						<form-image data="{{item}}" ng-model="item.name" ng-if="item.type=='image'"></form-image>
					</div>
				</div>
			</div>
			<div class="footer">
				<div ng-repeat="tab in mc.filterTabs">
					<span ng-repeat="item in tab.fields">
						<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button' && item.position=='footer' && tab.active"></form-button>
					</span>
					<!-- TBR legacy should be removed when all responses use position=footer/header/body -->
					<div class="form-component" ng-repeat="item in tab.buttons">
						<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button'"></form-button>
					</div>
				</div>
			</div>
		</div>
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************     FIN form filters   ***************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->

		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************        Form mincut      **************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->

		<div class="drop-down-form" ng-class="{'visible': mc.formMincut == 1}">
			<div class="header">
				<div class="title">
					<div class="ico-area">
						<img src="img/ic/toolbar/TB31.svg" />
					</div>
					<span class="title-area">{{mc.formName}}</span>
					<div class="buttons-area">
						<!-- Botón cerrar siempre visible -->
						<button ng-click="closePointInfo()"><img src="img/ic/ic_dropdown-form-close.svg" alt="<?php echo CLOSE; ?>" /></button>
						<!-- Botón cerrar siempre visible -->
					</div>
				</div>
				<div class="tabs">
					<ul>
						<li ng-repeat="tab in mc.mincutTabs" ng-class="{'active': tab.active}"><button ng-click="setActiveTab(tab.tabName)">{{tab.tabLabel}}</button></li>
					</ul>
				</div>

			</div>

			<div class="content">
				<div class="tab-content dynamicForm_formMincut" ng-repeat="tab in mc.mincutTabs">
					<div class="form-component form-component--equal-columns-row" ng-repeat="item in tab.fields">
						<form-text data="{{item}}" ng-model="item.name" ng-if="item.type=='text'"></form-text>
						<form-hidden data="{{item}}" ng-model="item.name" ng-if="item.type=='hidden'"></form-hidden>
						<form-combo data="{{item}}" ng-model="item.name" ng-if="item.type=='combo'"></form-combo>
						<form-area data="{{item}}" ng-model="item.name" ng-if="item.type=='textarea'"></form-area>
						<form-check data="{{item}}" ng-model="item.name" ng-if="item.type=='check'"></form-check>
						<form-datepicker data="{{item}}" ng-model="item.name" ng-if="item.type=='datepicker'"></form-datepicker>
						<form-datepickertime data="{{item}}" ng-model="item.name" ng-if="item.type=='datepickertime'"></form-datepickertime>
						<form-typeahead data="{{item}}" ng-model="item.name" ng-if="item.type=='typeahead'"></form-typeahead>
						<form-button data="{{item}}" ng-model="item.name" ng-if="item.type=='button'"></form-button>
						<form-divider data="{{item}}" ng-model="item.name" ng-if="item.type=='formDivider'"></form-divider>
						<form-list data="{{item}}" ng-if="item.type=='list' || item.type=='iconList'"></form-list>
					</div>
				</div>
			</div>


			<div class="footer">
				<div class="form-component form-component--equal-buttons-row">
					<!-- Botón upsert mincut -->
					<button class="btn btn-default-light" ng-click="upsertMincut()">
						<?php echo ACCEPT; ?>
					</button>
					<!-- Botón discart mincut -->
					<button class="btn btn-default-light" ng-class="{'btn-danger': mc.excludingMincut}" id="excludeFromMincutButton" ng-click="setExcludeMincut()" ng-show="mc.mincut_id!=null">
						<?php echo MINCUT_EXCLUDE; ?>
					</button>
				</div>
			</div>
		</div>

		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
		<!-- ********************************      FIN form mincut   ***************************** -->
		<!-- ************************************************************************************* -->
		<!-- ************************************************************************************* -->
	</div>

	<!-- ************************************************************************************* -->
	<!-- ************************************************************************************* -->
	<!-- ******************************     Attributes table      **************************** -->
	<!-- ************************************************************************************* -->
	<!-- ************************************************************************************* -->

	<div class="bottom-sheet" ng-show="mc.attributesTable" ng-class="{'visible': mc.attributesTable}">
		<div class="header">
			<div class="title">
				<button ng-click="closeTable()"><img src="img/ic/ic_dropdown-form-close.svg" alt="<?php echo CLOSE; ?>" /></button>
			</div>
		</div>

		<div class="content">
			<div class="selects"><?php echo FIELDS; ?>:&nbsp;
				<select id="tableFilterKey" ng-model="mc.tableFilterKey" data-ng-options="item as item for item in mc.filterFields">
				</select>
				&nbsp;<input type="text" ng-model="mc.tableFilterValue" />
				&nbsp;<input type="button" value="<?php echo FILTER; ?>" ng-click="filter()" />
				&nbsp;<input type="button" value="<?php echo EXPORT_TO_CSV; ?>" ng-click="exportData('csv')" />
				<div class="spacer"></div>
				<button class="btn" ng-show="mc.currentTablePage>1" ng-click="setTablePage(mc.currentTablePage-1)"><?php echo PREVIOUS; ?></button>
				<button class="btn" ng-show="mc.tableNumberOfPages>1 && mc.currentTablePage<mc.tableNumberOfPages" ng-click="setTablePage(mc.currentTablePage+1)"><?php echo NEXT; ?></button>

			</div>

			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th ng-repeat="field in mc.tableFields" ng-click="sort(field)" style="cursor: pointer;" ng-class="{ fieldSelected:field==mc.orderKey}" ng-show="renderHeader(field)">
								{{field}}
								<img ng-show="mc.orderSort=='ASC' && field==mc.orderKey" src="img/ic/sort_asc.svg" width="10" height="10" />
								<img ng-show="mc.orderSort=='DESC' && field==mc.orderKey" src="img/ic/sort_desc.svg" width="10" height="10" />
							</th>
						</tr>
					</thead>
					<tbody>
						<tr ng-repeat="data in mc.tableData">
							<td ng-repeat="key in notSorted(data)" ng-class="{ rowSelected: getId(data,mc.tableIdName)==mc.pol_id}" ng-init="value = data[key]" ng-click="getInfoFromTable(data)" ng-if="key!='$$hashKey'">{{value}}</td>
						</tr>
					</tbody>
				</table>
			</div>


		</div>


		<!-- input invisible for image -->
		<?php if ($touchDevice) { ?>
			<input style="display: none;" type="file" id="takepicture" name="takepicture" ng-file-select="onFileSelect($files)" accept="image/*">
		<?php } else { ?>
			<input style="display: none;" type="file" id="takepicture" name="takepicture" ng-file-select="onFileSelect($files)">
		<?php } ?>
		<!-- end input for image -->
	</div>

	<!-- ************************************************************************************* -->
	<!-- ************************************************************************************* -->
	<!-- **************************     END Attributes table      **************************** -->
	<!-- ************************************************************************************* -->
	<!-- ************************************************************************************* -->

	<script src="<?php echo $baseHref; ?>/js/libs/jquery/3.1.1/jquery.min.js"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/jquery/1.12.1/jquery-ui.min.js"></script>
	<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
	<script src="<?php echo $baseHref; ?>/js/libs/jqueryui-datetimepicker/jquery.datetimepicker.full.min.js"></script>
	<link rel="stylesheet" href="<?php echo $baseHref; ?>/js/libs/jqueryui-datetimepicker/jquery.datetimepicker.min.css">

	<!--	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>-->
	<script src="<?php echo $baseHref; ?>/js/libs/angularjs/1.3.4/angular.min.js"></script>

	<!-- angular-bootstrap-ui -->
	<script src="<?php echo $baseHref; ?>js/libs/angularjs/1.4.8/angular-animate.js"></script>
	<link rel="stylesheet" href="<?php echo $baseHref; ?>/js/libs/angular-bootstrap-ui/ui-bootstrap-custom-1.1.0-csp.css" />
	<script src="<?php echo $baseHref; ?>js/libs/angular-bootstrap-ui/ui-bootstrap-custom-1.1.0.min.js"></script>
	<script src="<?php echo $baseHref; ?>js/libs/angular-bootstrap-ui/ui-bootstrap-custom-tpls-1.1.0.min.js"></script>
	<script src="<?php echo $baseHref; ?>js/libs/angular-bootstrap-ui/angular-locale_es.es.js"></script>
	<!-- end angular-bootstrap-ui -->
	<!-- notify.js -->
	<script src="<?php echo $baseHref; ?>/js/libs/notify.min.js"></script>
	<!-- end notify.js -->
	<!-- loading bar.js -->
	<script src="<?php echo $baseHref; ?>/js/libs/angular-loading-bar/loading-bar.min.js"></script>
	<link rel="stylesheet" href="<?php echo $baseHref; ?>/js/libs/angular-loading-bar/loading-bar.min.css" />
	<!-- end loading bar.js -->
	<!-- block UI js -->
	<script src="<?php echo $baseHref; ?>/js/libs/angular-block-ui/angular-block-ui.min.js"></script>
	<link rel="stylesheet" href="<?php echo $baseHref; ?>/js/libs/angular-block-ui/angular-block-ui.min.css" />
	<!-- end block UI js -->

	<!-- Application -->
	<script src="<?php echo $baseHref; ?>/js/libs/ol/v4.2.0/build/ol.js"></script>
	<link rel="stylesheet" href="<?php echo $baseHref; ?>/js/libs/ol/css/ol.css" />
	<script src="<?php echo $baseHref; ?>/js/libs/proj4.js"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/epsg/25829.js" type="text/javascript"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/epsg/25830.js" type="text/javascript"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/epsg/25831.js" type="text/javascript"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/localforage.min.js"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/exif.js"></script>

	<?php
	if ($env === "dev") {
	?>
		<script src="<?php echo $baseHref; ?>/js/bmaps/app.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapFactory.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapMeasureTool.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapSelectTool.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapAddTool.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapToc.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapAjaxOperations.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapPhotos.js"></script>
		<!-- offline -->
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapOffline.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/mapStorage.js"></script>
		<!-- end offline -->
		<script src="<?php echo $baseHref; ?>js/directives/toolsDirectives.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/directives/feauturesDirectives.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/loggerService.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/fileReader.js"></script>
		<script src="<?php echo $baseHref; ?>/js/bmaps/fileUpload.js"></script>
		<!-- Backgrounds -->
		<script src="<?php echo $baseHref; ?>js/src/bgBundle.js"></script>
	<?php
	} else {
	?>
		<script src="<?php echo $baseHref; ?>js/dist/bmaps.2.3.0.min.js"></script>

		<!-- Backgrounds -->
		<script src="<?php echo $baseHref; ?>js/dist/bgBundle.1.0.0.min.js"></script>
	<?php
	}
	?>

	<script src="<?php echo $baseHref; ?>/js/libs/xml2json.min.js"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/simple-lightbox.min.js"></script>
	<script src="<?php echo $baseHref; ?>/js/libs/socket.io.1.4.5.min.js"></script>
	<?php
	if ($env === "dev") {
	?>
		<script src="<?php echo $baseHref; ?>/js/src/loginBundle.js"></script>
		<script src="<?php echo $baseHref; ?>js/src/formsBundle.js"></script>
		<script src="<?php echo $baseHref; ?>js/src/tableBundle.js"></script>
		<script src="<?php echo $baseHref; ?>js/src/notificationsBundle.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/interface.js"></script>

		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.table.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.photos.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.offline.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.filters.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.visits.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.notifications.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.autologout.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.accessControl.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.multiupdate.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.flowtrace.js"></script>
		<script src="<?php echo $baseHref; ?>tpl/default/js/src/controller.profile.js"></script>
	<?php
	} else {
	?>
		<script src="<?php echo $baseHref; ?>js/dist/loginBundle.1.0.1.min.js"></script>
		<script src="<?php echo $baseHref; ?>js/dist/formsBundle.1.1.0.min.js"></script>
		<script src="<?php echo $baseHref; ?>js/dist/tableBundle.1.1.0.min.js"></script>
		<script src="<?php echo $baseHref; ?>js/dist/notificationsBundle.1.0.0.min.js"></script>
		<script src="<?php echo $baseHref; ?>/tpl/default/js/dist/uiMaps.3.3.0.min.js"></script>
	<?php
	}
	?>
</body>

</html>