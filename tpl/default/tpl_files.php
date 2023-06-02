<div class="row" id="app">
  <form id="panel_data">
    <input type="hidden" name="environment" id="environment" value="<?php echo $env; ?>">
    <input type="hidden" name="token" id="token" value="<?php echo $token; ?>">
    <input type="hidden" name="user_id" id="user_id" value="<?php echo $user_id; ?>">
    <input type="hidden" name="baseHref" id="baseHref" value="<?php echo $baseHref; ?>">
    <input type="hidden" name="project_id" id="project_id" value="<?php echo $project_id; ?>">
    <input type="hidden" name="serverInstance" id="serverInstance" value="<?php echo $serverInstance; ?>">
    <input type="hidden" name="limit" id="limit" value="<?php echo $limit; ?>">
    <input type="hidden" name="str_downloading" id="str_downloading" value="<?php echo DOWNLOADING; ?>">
    <input type="hidden" name="str_confirm" id="str_confirm" value="<?php echo CONFIRM_DELETE; ?>">

  </form>
  <div class="col-sm-12" v-cloak>
    <nav class="navbar navbar-default">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <?php echo FILES; ?> <?php echo $Project_name; ?>
        </a>
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" v-cloak>{{project_alias}}</a>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

          <form class="navbar-form navbar-left" role="search" action="files.php?w=<?php echo $_GET['w']; ?>" method="get">
            <div class="form-group">
              <?php echo FROM; ?> <input type="text" class="form-control" placeholder="Date" name="from" id="from" value="<?php echo $from; ?>"> <?php echo TO; ?> <input type="text" class="form-control" placeholder="Date" name="to" id="to" value="<?php echo $to; ?>">
            </div>
            <a href="<?php echo $baseHref; ?>files.php?w=<?php echo $_GET['w']; ?>" class="btn btn-default">Reset</a>
          </form>

        </div><!-- /.navbar-collapse -->
      </div><!-- /.container-fluid -->
    </nav>
    <div class="row equal">
      <div v-for="(item,index) in files">
        <div class="col-xs-6 col-md-3 ">
          <div class="thumbnail">
            <a :href="'<?php echo $baseHref; ?>external.image.php?img='+item._id.$oid+'&metaData=1'" target="_blank">

              <img v-if="getType(item)=='image'" v-bind:src="item.thumb" width="96" height="72" v-show="item.thumb!=null">
              <img v-if="getType(item)=='file' || item.thumb==null" src="img/ic/image-gallery-placeholder.svg" width="72" height="72">
            </a>
            <div style="text-align: center;">
              <small v-show="item.fileName!=null">{{truncateString(item.fileName,16)}}</small>
              <small v-show="item.fileName==null"></small>
              <br>
              {{item.attachedTo}} - ID: {{getID(item)}}
              <br>
              <small v-show="item.date!=null">{{item.date}}</small>
              <small v-show="item.date==null">No date</small>
            </div>
            <div class="caption">
              <p align="center"><a :href="getInfoLink(item)"> <img src="img/ic/map-marker.svg" width="72" height="72"></a>
                <?php if ($canDelete) {
                ?>
                  <a v-on:click="deleteFile(item)" class="btn btn-danger" role="button"><?php echo DELETE; ?></a>
                <?php
                }
                ?>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
<script type="text/javascript" src="../../js/libs/jquery-blockUI/2.70/jquery.blockUI.js"></script>
<script type="text/javascript" src="../../js/libs/vue.min.2.6.10.js"></script>
<?php if ($env === "dev") { ?>
  <script type="text/javascript" src="../../js/src/filesBundle.js"></script>
  <script type="text/javascript" src="../../tpl/default/js/src/ui.files.js"></script>
<?php } else { ?>
  <script type="text/javascript" src="../../js/dist/filesBundle.1.0.0.min.js"></script>
  <script type="text/javascript" src="../../tpl/default/js/dist/ui.files.1.0.0.min.js"></script>
<?php } ?>