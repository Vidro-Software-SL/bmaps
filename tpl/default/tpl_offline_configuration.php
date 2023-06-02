<div class="row" id="app">
  <form id="panel_data">
  <input type="hidden" name="environment" 		id="environment"		value="<?php echo $env; ?>">
  <input type="hidden" name="token"	 					id="token" 					value="<?php echo $token; ?>">
  <input type="hidden" name="user_id"	 				id="user_id" 				value="<?php echo $user_id; ?>">
  <input type="hidden" name="baseHref" 			  id="baseHref" 			value="<?php echo $baseHref; ?>">
  <input type="hidden" name="storeName" 			id="storeName" 			value="<?php echo $offlineStoreName; ?>">
  <input type="hidden" name="cacheVersion" 		id="cacheVersion" 	value="<?php echo $offlineCacheVersion; ?>">
  <input type="hidden" name="localForageVersion" id="localForageVersion" 	value="<?php echo $offlineLocalForageVersion; ?>">
  <input type="hidden" name="serverInstance" 	id="serverInstance" value="<?php echo $serverInstance; ?>">
  <input type="hidden" name="offlineLogin" 		id="offlineLogin" 	value="<?php echo $offlineLogin; ?>">
</form>
    <div class="col-sm-5">
        <table>
            <thead>
                <tr>
                    <th>
                        <img src="img/ic/offline.svg" class="svg ico" />
                        OFFLINE
                    </th>
                </tr>
            </thead>
            <tbody>
              <tr>
                  <td>
                    <img src="img/ic/settings.svg" class="svg ico" />
                    <?php echo OFFLINE_DATA; ?>
                    <br><br>
                    Total: <b>{{storedData.totalUsed}}</b> / <?php echo OFFLINE_PERCENTAGE_USED_SPACE; ?>: <b>{{storedData.usedPercentage}}%</b>
                    <br>
                    indexedDB: <b>{{storedData.indexDbUsedMb}}</b>
                    <br>
                    localStorage: <b>{{storedData.localStorageUsed}}</b>
                    <br><br>
                    <button type="button"  class="btn btn-primary-custom" v-on:click="reset()"><?php echo OFFLINE_RESET; ?></button>
                    <br>
                    <br>
                  </td>
              </tr>
              <?php
              if($offlineLogin){
              ?>
              <tr>
                  <td>
                    <img src="img/ic/offline.svg" class="svg ico" height="25" width="25" />
                    <span style="color: #52ad21;">offline login enabled</span>
                  </td>
              </tr>
              <?php
            }else{
            ?>
            <tr>
                <td>
                  <img src="img/ic/online.svg" class="svg ico" height="25" width="25" />
                  <span style="color: #ad2121;">offline login disabled</span>

                </td>
            </tr>
          <?php } ?>
              <tr v-show='stored_credentials.length>0'>
                  <td>
                    <img src="img/ic/ic-users.svg" class="svg ico" height="25" width="25" />
                    <?php echo OFFLINE_STORED_USERS; ?><br><br>
                    <ul>
                      <li v-for="item in storedData.stored_credentials">{{item.email}} <img src="img/ic/delete.svg" class="svg ico" height="20" width="20" v-on:click="removeItem(item.key)"/></li>
                    </ul>
                  </td>
              </tr>
              <tr>
                  <td>
                    <img src="img/ic/settings.svg" class="svg ico" />
                    Service worker
                    <svg height="25" viewBox="0 0 1792 1792" width="25" xmlns="http://www.w3.org/2000/svg"><path v-bind:class="{'greenDot': serviceWorker,  'redDot': !serviceWorker}" d="M1152 896q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm-256-544q-148 0-273 73t-198 198-73 273 73 273 198 198 273 73 273-73 198-198 73-273-73-273-198-198-273-73zm768 544q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"/></svg>
                    <br><br>
                    <button type="button" v-show="serviceWorker" class="btn btn-primary-custom" v-on:click="removeServiceWorker()">Remove serviceWorker</button>
                  </td>
              </tr>
              <tr v-show='storedData.stored_cookie'>
                <td>
                  <img src="img/ic/cookie.svg" class="svg ico" height="25" width="25" />
                  Cookie <img src="img/ic/delete.svg" class="svg ico" height="20" width="20" v-on:click="removeItem('tocCookie')"/></li>
                  </ul>
                </td>
              </tr>

              <tr v-for="(item,index) in storedData.stored_projects">
                  <td>
                    <img src="img/ic/map-marker.svg" class="svg ico" />
                      Project {{item}} <img src="img/ic/delete.svg" class="svg ico" height="20" width="20" v-on:click="deleteProject(item)"/>
                      <ul>
                        <li v-for="dat in storedData.stored_project_data[index]"><b>{{dat.pretty}}</b></li>
                      </ul>
                      <ul v-show="getOfflineVisits(item).length>0">
                        <li>
                          <img src="img/ic/dump.svg" class="svg ico" height="25" width="25"/>
                          <button type="button"  class="btn btn-primary-custom"><?php echo OFFLINE_DUMP_DATA; ?></button>
                        </li>

                      </ul>
                  </td>
                </tr>
            </tbody>
        </table>
    </div>

</div>
  <script type="text/javascript" src="../../js/libs/vue.min.2.6.10.js"></script>
<?php if($env==="dev"){ ?>

  <script type="text/javascript" src="../../js/src/offlineBundle.js"></script>
	<script type="text/javascript" src="../../tpl/default/js/src/ui.offline.js"></script>
<?php }else{ ?>
  <script type="text/javascript" src="../../js/dist/offlineBundle.1.0.0.min.js"></script>
  <script type="text/javascript" src="../../tpl/default/js/dist/ui.offline.1.0.0.min.js"></script>
<?php } ?>
