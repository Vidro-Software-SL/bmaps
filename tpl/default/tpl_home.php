<div class="row" id="app">
  <form id="panel_data">

  <input type="hidden" name="environment" 		id="environment"		value="<?php echo $env; ?>">
  <input type="hidden" name="token"	 					id="token" 					value="<?php echo $token; ?>">
  <input type="hidden" name="user_id"	 				id="user_id" 				value="<?php echo $user_id; ?>">
  <input type="hidden" name="baseHref" 			  id="baseHref" 			value="<?php echo $baseHref; ?>">
  <input type="hidden" name="storeName" 			id="storeName" 			value="bmaps_default">
  <input type="hidden" name="cacheVersion" 		id="cacheVersion" 	value="bmaps-0.0.2">
  <input type="hidden" name="serverInstance" 	id="serverInstance" value="<?php echo $serverInstance; ?>">
  <input type="hidden" name="useOffline" 	    id="useOffline"     value="<?php echo $useOffline; ?>">
  <input type="hidden" name="device" 	        id="device"         value="<?php echo $device; ?>">
  <input type="hidden" name="storeName" 			id="storeName" 			value="<?php echo $offlineStoreName; ?>">
  <input type="hidden" name="cacheVersion" 		id="cacheVersion" 	value="<?php echo $offlineCacheVersion; ?>">
  <input type="hidden" name="localForageVersion" id="localForageVersion" 	value="<?php echo $offlineLocalForageVersion; ?>">
  <textarea name="roles" id="roles" value="" style="display:none;"><?php echo $user_roles; ?></textarea>
</form>

      <div class="col-sm-12">

        <!-- *********************************************************** >

                                      PROJECTS

             **********************************************************-->

        <table>
            <thead>
                <tr>
                    <th>
                        <img src="img/home/ic_squares.svg" />
                        <?php echo PROJECTS_OVERVIEW; ?>
                    </th>
                    <th v-show="device==0"><?php echo ATTRIBUTE_TABLE; ?></th>
                    <th v-show="useOffline"><?php echo OFFLINE_DUMP_DATA; ?> <img src="img/ic/offline.svg" /></th>


                    <th><?php echo FILES; ?></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in projects">
                    <td>
                        <a :href="'<?php echo $baseHref; ?>project.php?w='+item.project_id" class="block">
                            <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM13 3a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="#FFF" fill-rule="evenodd"/>
                            </svg>
                            {{item.alias}}
                            <svg class="pull-right" width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 21c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C7.477 3 3 7.477 3 13A10 10 0 1 0 13 3zm-2 14.5l6-4.5-6-4.5v9z" fill="#FFF" fill-rule="evenodd"/>
                            </svg>
                        </a>
                    </td>
                    <td align="center" v-show="device==0" v-if="canAccessFeature(item.buttons,'Table')==1">

                      <a :href="'<?php echo $baseHref; ?>table.php?w='+item.project_id" class="block">
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24">
                          <path d="M4,3H20A2,2 0 0,1 22,5V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V5A2,2 0 0,1 4,3M4,7V10H8V7H4M10,7V10H14V7H10M20,10V7H16V10H20M4,12V15H8V12H4M4,20H8V17H4V20M10,12V15H14V12H10M10,20H14V17H10V20M20,20V17H16V20H20M20,12H16V15H20V12Z" />
                        </svg>
                      </a>
                    </td>
                    <td align="center" v-show="device==0" v-else>

                      <a class="block">
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24" >
                          <path d="M4,3H20A2,2 0 0,1 22,5V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V5A2,2 0 0,1 4,3M4,7V10H8V7H4M10,7V10H14V7H10M20,10V7H16V10H20M4,12V15H8V12H4M4,20H8V17H4V20M10,12V15H14V12H10M10,20H14V17H10V20M20,20V17H16V20H20M20,12H16V15H20V12Z" style="stroke: #CCC; fill: #CCC;"/>
                        </svg>
                      </a>
                    </td>
                    <td align="center" v-show="useOffline">
                      <img v-show="item.offlineVisits>0"class="pull-right" src="img/ic/icon_reminder.png" width="24" height="24"  v-on:click="dumpData(item)"/>
                    </td>
                    <td align="center">

                      <a :href="'<?php echo $baseHref; ?>files.php?w='+item.project_id" class="block"  v-if="canAccess('file_manager_view',item.project_id)">
                        <img src="img/ic/addFile.svg" width="24" height="24">
                      </a>
                      <a :href="'<?php echo $baseHref; ?>files.php?w='+item.project_id" class="block"  v-else>
                        <img src="img/ic/addFile_off.svg" width="24" height="24">
                      </a>
                    </td>
                </tr>

            </tbody>
        </table>
        <!-- *********************************************************** >

                                    END PROJECTS

             **********************************************************-->


    </div>
    <!-- **************************************************************** -->
    <!-- ****************              Modal alert               ******** -->
    <!-- **************************************************************** -->
    <div class="modal fade" id="modalAlert" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">

          <div class="modal-body">
            {{blockUiMsg}}
          </div>

        </div>
      </div>
    </div>
    <!-- **************************************************************** -->
    <!-- ****************           END Modal alert              ******** -->
    <!-- **************************************************************** -->
</div>

<script src="../../js/libs/jquery/3.1.1/jquery.min.js"></script>
<script type="text/javascript" src="../../js/libs/vue.min.2.6.10.js"></script>
<?php if($env==="dev"){ ?>
  <script type="text/javascript" src="../../js/src/homeBundle.js"></script>
	<script type="text/javascript" src="../../tpl/default/js/src/ui.home.js"></script>
<?php }else{ ?>
  <script type="text/javascript" src="../../js/dist/homeBundle.1.0.1.min.js"></script>
	<script type="text/javascript" src="../../tpl/default/js/dist/ui.home.1.0.5.min.js"></script>
<?php } ?>
