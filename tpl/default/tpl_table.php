<div class="row" id="app">
  <form id="panel_data">
  <input type="hidden" name="environment" 		id="environment"		value="<?php echo $env; ?>">
  <input type="hidden" name="token"	 					id="token" 					value="<?php echo $token; ?>">
  <input type="hidden" name="user_id"	 				id="user_id" 				value="<?php echo $user_id; ?>">
  <input type="hidden" name="baseHref" 			  id="baseHref" 			value="<?php echo $baseHref; ?>">
  <input type="hidden" name="project_id" 			id="project_id" 		value="<?php echo $project_id; ?>">
  <input type="hidden" name="serverInstance" 	id="serverInstance" value="<?php echo $serverInstance; ?>">
  <input type="hidden" name="limit" 	id="limit" value="<?php echo $limit; ?>">

</form>
    <div class="col-sm-12" v-cloak>
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 24 24">
            <path d="M4,3H20A2,2 0 0,1 22,5V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V5A2,2 0 0,1 4,3M4,7V10H8V7H4M10,7V10H14V7H10M20,10V7H16V10H20M4,12V15H8V12H4M4,20H8V17H4V20M10,12V15H14V12H10M10,20H14V17H10V20M20,20V17H16V20H20M20,12H16V15H20V12Z" />
          </svg>
          </a>
          <!-- Brand and toggle get grouped for better mobile display -->
          <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" v-cloak>{{project_alias}}</a> <a class="navbar-brand" v-cloak>{{db_table}}</a>
          </div>

          <!-- Collect the nav links, forms, and other content for toggling -->
          <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

            <ul class="nav navbar-nav navbar-left">
              <li class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><?php echo TABLES; ?> <span class="caret"></span></a>
                <ul class="dropdown-menu" v-cloak>
                  <li v-for="item in tables" v-show="item.db_table!=null" v-on:click='selectTable(item.db_table)'>
                    <span v-show="item.db_table==db_table" v-cloak><b>{{item.qgis_name}} ({{item.db_table}})</b></span>
                    <span v-show="item.db_table!=db_table" v-cloak>{{item.qgis_name}} ({{item.db_table}})</span>
                  </li>
                </ul>
              </li>
            </ul>
            <ul class="nav navbar-nav navbar-right" v-cloak>
              <li class="dropdown" v-cloak>
                <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                  <span v-show="filter_field!=''" v-cloak>{{filter_field}}</span>
                  <span v-show="filter_field==null"><?php echo FIELDS; ?> </span>
                  <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                  <li v-show="filter_field!=null" v-on:click='selectFilter("")' style="cursor:pointer;"><b><?php echo FIELDS; ?></b></li>
                  <li v-for="item in fields" v-show="db_table!=null" v-on:click='selectFilter(item)' style="cursor:pointer;">{{item}}</li>
                </ul>
              </li>
            </ul>
            <form class="navbar-form navbar-right">
              {{filter_field}}
              <div class="form-group">
              <input type="text" class="form-control" placeholder="<?php echo SEARCH; ?>" v-model="filter_value">
              </div>
              <button type="button" class="btn btn-default" v-on:click="filter()"><?php echo SEARCH; ?></button>
              <button type="button" class="btn btn-default" v-on:click="exportData()"><?php echo EXPORT_TO_CSV; ?></button>
            </form>

          </div><!-- /.navbar-collapse -->
        </div><!-- /.container-fluid -->
      </nav>

        <table class="table">
          <thead>
              <tr>
                <th>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M15,19L9,16.89V5L15,7.11M20.5,3C20.44,3 20.39,3 20.34,3L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.61,21 3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z" /></svg>
                </th>
                <th v-for="item in fields"  v-show="item!='the_geom' && item!='geom' && item!='geometry'">
                  {{item}}
                </th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="item in data" v-bind:class="{ success: getId(item,fields[0])==currentPolId}">
                <td >
                  <a :href="'<?php echo $baseHref; ?>project.php?w='+project_id+'&table='+db_table+'&id_name='+fields[0]+'&pol_id='+getId(item,fields[0])" class="block">
                    <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM13 3a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="#FFF" fill-rule="evenodd"/>
                    </svg>
                  </a>
                </td>
                <td v-for="(atom, key, index) in item" v-show="key!='the_geom' && key!='geom' && key!='geometry'">
                  {{atom}}
                </td>

              </tr>
              <tr v-show="data.length==0">
                <td v-bind:colspan="fields.length">
                  <?php echo NO_INFO; ?>
                </td>
              </tr>
          </tbody>
        </table>

        <nav aria-label="Page navigation" v-show="numberOfPages>0">
          <ul class="pagination">
              <button class="btn" v-show="currentPage>1" v-on:click="setPage(currentPage-1)"><?php echo PREVIOUS; ?></button>
              <button class="btn" v-show="numberOfPages>1 && currentPage<numberOfPages" v-on:click="setPage(currentPage+1)"><?php echo NEXT; ?></button>
            </li>
          </ul>
        </nav>

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
  <script type="text/javascript" src="../../js/src/tableBundle.js"></script>
	<script type="text/javascript" src="../../tpl/default/js/src/ui.table.js"></script>
<?php }else{ ?>
  <script type="text/javascript" src="../../js/dist/tableBundle.1.1.0.min.js"></script>
	<script type="text/javascript" src="../../tpl/default/js/dist/ui.table.1.1.0.min.js"></script>
<?php } ?>
